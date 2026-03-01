const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// ── Get current user profile ────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, university, avatar_url, role, xp, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ── Update profile ──────────────────────────────────────
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { full_name, university } = req.body;
    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), university = COALESCE(?, university) WHERE id = ?',
      [full_name, university, req.user.id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

// ── Leaderboard ─────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, avatar_url, university, xp FROM users ORDER BY xp DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard.' });
  }
});

module.exports = router;
