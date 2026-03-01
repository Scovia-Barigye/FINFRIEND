const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// ── List published blog posts ───────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.cover_img, bp.created_at,
             u.full_name as author, u.avatar_url
      FROM blog_posts bp JOIN users u ON u.id = bp.author_id
      WHERE bp.published = TRUE
      ORDER BY bp.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load blog posts.' });
  }
});

// ── Get single blog post ────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bp.*, u.full_name as author, u.avatar_url
      FROM blog_posts bp JOIN users u ON u.id = bp.author_id
      WHERE bp.slug = ? AND bp.published = TRUE
    `, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load post.' });
  }
});

module.exports = router;
