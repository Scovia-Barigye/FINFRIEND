const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// ── List categories ─────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const [cats] = await pool.query(`
      SELECT fc.*, COUNT(ft.id) as thread_count
      FROM forum_categories fc
      LEFT JOIN forum_threads ft ON ft.category_id = fc.id
      GROUP BY fc.id ORDER BY fc.id
    `);
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

// ── List threads (optional category filter) ─────────────
router.get('/threads', async (req, res) => {
  try {
    let sql = `
      SELECT ft.*, u.full_name as author, u.avatar_url,
             fc.name as category_name, fc.icon as category_icon,
             (SELECT COUNT(*) FROM forum_replies fr WHERE fr.thread_id = ft.id) as reply_count
      FROM forum_threads ft
      JOIN users u ON u.id = ft.user_id
      JOIN forum_categories fc ON fc.id = ft.category_id
    `;
    const params = [];
    if (req.query.category) {
      sql += ' WHERE fc.slug = ?';
      params.push(req.query.category);
    }
    sql += ' ORDER BY ft.created_at DESC LIMIT 50';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load threads.' });
  }
});

// ── Get single thread with replies ──────────────────────
router.get('/threads/:id', async (req, res) => {
  try {
    // increment views
    await pool.query('UPDATE forum_threads SET views = views + 1 WHERE id = ?', [req.params.id]);

    const [thread] = await pool.query(`
      SELECT ft.*, u.full_name as author, u.avatar_url, fc.name as category_name
      FROM forum_threads ft
      JOIN users u ON u.id = ft.user_id
      JOIN forum_categories fc ON fc.id = ft.category_id
      WHERE ft.id = ?
    `, [req.params.id]);

    if (!thread.length) return res.status(404).json({ error: 'Thread not found.' });

    const [replies] = await pool.query(`
      SELECT fr.*, u.full_name as author, u.avatar_url
      FROM forum_replies fr JOIN users u ON u.id = fr.user_id
      WHERE fr.thread_id = ? ORDER BY fr.created_at ASC
    `, [req.params.id]);

    res.json({ ...thread[0], replies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load thread.' });
  }
});

// ── Create thread ───────────────────────────────────────
router.post('/threads', authMiddleware, async (req, res) => {
  try {
    const { category_id, title, body } = req.body;
    if (!category_id || !title || !body) {
      return res.status(400).json({ error: 'category_id, title, and body are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO forum_threads (category_id, user_id, title, body) VALUES (?, ?, ?, ?)',
      [category_id, req.user.id, title, body]
    );
    res.status(201).json({ id: result.insertId, message: 'Thread created.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create thread.' });
  }
});

// ── Post reply ──────────────────────────────────────────
router.post('/threads/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'body is required.' });

    const [result] = await pool.query(
      'INSERT INTO forum_replies (thread_id, user_id, body) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, body]
    );

    // Award XP for participation
    await pool.query('UPDATE users SET xp = xp + 2 WHERE id = ?', [req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Reply posted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post reply.' });
  }
});

module.exports = router;
