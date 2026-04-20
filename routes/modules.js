const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// ── List all modules ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let sql = 'SELECT id, title, slug, description, category, difficulty, cover_img, xp_reward FROM modules WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
    sql += ' ORDER BY id ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load modules.' });
  }
});

// ── Get single module ───────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM modules WHERE slug = ?', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Module not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load module.' });
  }
});

// ── Get quizzes for a module ────────────────────────────
router.get('/:slug/quiz', async (req, res) => {
  try {
    const [mod] = await pool.query('SELECT id FROM modules WHERE slug = ?', [req.params.slug]);
    if (!mod.length) return res.status(404).json({ error: 'Module not found.' });

    const [quizzes] = await pool.query(
      'SELECT id, question, option_a, option_b, option_c, option_d FROM quizzes WHERE module_id = ?',
      [mod[0].id]
    );
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load quiz.' });
  }
});

// ── Submit quiz answers ─────────────────────────────────
router.post('/:slug/quiz', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: 'a' | 'b' | 'c' | 'd' }
    const [mod] = await pool.query('SELECT id, xp_reward FROM modules WHERE slug = ?', [req.params.slug]);
    if (!mod.length) return res.status(404).json({ error: 'Module not found.' });

    const moduleId = mod[0].id;
    const [quizzes] = await pool.query('SELECT id, correct FROM quizzes WHERE module_id = ?', [moduleId]);

    let score = 0;
    quizzes.forEach(q => {
      if (answers[q.id] && answers[q.id].toLowerCase() === q.correct) score++;
    });

    const percentage = quizzes.length ? Math.round((score / quizzes.length) * 100) : 0;
    const passed = percentage >= 60;

    // Upsert progress
    await pool.query(`
      INSERT INTO user_progress (user_id, module_id, completed, quiz_score, completed_at)
      VALUES (?, ?, ?, ?, ${passed ? 'NOW()' : 'NULL'})
      ON DUPLICATE KEY UPDATE quiz_score = VALUES(quiz_score), completed = VALUES(completed),
        completed_at = ${passed ? 'NOW()' : 'completed_at'}
    `, [req.user.id, moduleId, passed, percentage]);

    // Award XP if passed
    if (passed) {
      await pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [mod[0].xp_reward, req.user.id]);
    }

    res.json({ score, total: quizzes.length, percentage, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz submission failed.' });
  }
});

// ── Mark module as complete (no quiz required) ──────────
// router.post('/:slug/complete', authMiddleware, async (req, res) => {
//   try {
//     const [mod] = await pool.query('SELECT id, xp_reward FROM modules WHERE slug = ?', [req.params.slug]);
//     if (!mod.length) return res.status(404).json({ error: 'Module not found.' });

//     await pool.query(`
//       INSERT INTO user_progress (user_id, module_id, completed, completed_at)
//       VALUES (?, ?, TRUE, NOW())
//       ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()
//     `, [req.user.id, mod[0].id]);

//     await pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [mod[0].xp_reward, req.user.id]);

//     res.json({ message: 'Module completed!', xp_earned: mod[0].xp_reward });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to complete module.' });
//   }
// });

// ── Mark module as complete (no quiz required) ──────────
// Multiple XP award FIX
router.post("/:slug/complete", authMiddleware, async (req, res) => {
  try {
    const [mod] = await pool.query(
      "SELECT id, xp_reward FROM modules WHERE slug = ?",
      [req.params.slug],
    );
    if (!mod.length)
      return res.status(404).json({ error: "Module not found." });

    // Check if this user already completed this module before
    const [existing] = await pool.query(
      "SELECT completed FROM user_progress WHERE user_id = ? AND module_id = ?",
      [req.user.id, mod[0].id],
    );

    // Figure out if they were already marked complete before this click
    const alreadyCompleted = existing.length > 0 && existing[0].completed === 1;

    // Always save/update the progress row
    await pool.query(
      `
      INSERT INTO user_progress (user_id, module_id, completed, completed_at)
      VALUES (?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()
    `,
      [req.user.id, mod[0].id],
    );

    // Only give XP if they were NOT already completed before this click
    if (!alreadyCompleted) {
      await pool.query("UPDATE users SET xp = xp + ? WHERE id = ?", [
        mod[0].xp_reward,
        req.user.id,
      ]);
      return res.json({
        message: "Module completed!",
        xp_earned: mod[0].xp_reward,
      });
    }

    // If they already completed it, tell them but don't add XP again
    res.json({ message: "Module already completed.", xp_earned: 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete module." });
  }
});

module.exports = router;
