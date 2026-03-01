const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ── Dashboard overview ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await pool.query(
      'SELECT full_name, xp, avatar_url FROM users WHERE id = ?', [userId]
    );
    const [progress] = await pool.query(
      `SELECT m.title, m.slug, p.completed, p.quiz_score
       FROM user_progress p JOIN modules m ON m.id = p.module_id
       WHERE p.user_id = ?`, [userId]
    );
    const [expenses] = await pool.query(
      `SELECT category, SUM(amount) as total FROM expenses
       WHERE user_id = ? AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY category`, [userId]
    );
    const [goals] = await pool.query(
      'SELECT * FROM goals WHERE user_id = ?', [userId]
    );
    const [badges] = await pool.query(
      `SELECT b.name, b.icon, b.description, ub.earned_at
       FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = ?`, [userId]
    );

    res.json({
      user: user[0],
      modules_completed: progress.filter(p => p.completed).length,
      total_modules: (await pool.query('SELECT COUNT(*) as c FROM modules'))[0][0].c,
      progress,
      expenses,
      goals,
      badges
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
});

// ── Expenses CRUD ───────────────────────────────────────
router.get('/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC LIMIT 100',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load expenses.' });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const { category, amount, description, expense_date } = req.body;
    if (!category || !amount || !expense_date) {
      return res.status(400).json({ error: 'category, amount and expense_date are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category, amount, description || null, expense_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Expense added.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense.' });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

// ── Goals CRUD ──────────────────────────────────────────
router.get('/goals', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load goals.' });
  }
});

router.post('/goals', async (req, res) => {
  try {
    const { title, target_amount, deadline } = req.body;
    if (!title || !target_amount) {
      return res.status(400).json({ error: 'title and target_amount are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO goals (user_id, title, target_amount, deadline) VALUES (?, ?, ?, ?)',
      [req.user.id, title, target_amount, deadline || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Goal created.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

router.put('/goals/:id', async (req, res) => {
  try {
    const { saved_amount } = req.body;
    await pool.query(
      'UPDATE goals SET saved_amount = ? WHERE id = ? AND user_id = ?',
      [saved_amount, req.params.id, req.user.id]
    );
    res.json({ message: 'Goal updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

router.delete('/goals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

module.exports = router;
