const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// ── List all badges ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM badges ORDER BY xp_required ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load badges.' });
  }
});

// ── Get user's badges ───────────────────────────────────
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = ? ORDER BY ub.earned_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load your badges.' });
  }
});

// ── Check & award badges ────────────────────────────────
router.post('/check', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user] = await pool.query('SELECT xp FROM users WHERE id = ?', [userId]);
    const xp = user[0].xp;

    // Get badges user hasn't earned yet
    const [unearned] = await pool.query(`
      SELECT b.* FROM badges b
      WHERE b.xp_required > 0 AND b.xp_required <= ?
        AND b.id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)
    `, [xp, userId]);

    const awarded = [];
    for (const badge of unearned) {
      await pool.query('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
      awarded.push(badge);
    }

    res.json({ awarded });
  } catch (err) {
    res.status(500).json({ error: 'Badge check failed.' });
  }
});

module.exports = router;
