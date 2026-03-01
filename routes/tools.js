const express = require('express');
const router = express.Router();

// ── Budget Calculator ───────────────────────────────────
router.post('/budget', (req, res) => {
  const { income, needs_pct = 50, wants_pct = 30, savings_pct = 20 } = req.body;
  if (!income || income <= 0) {
    return res.status(400).json({ error: 'A positive income value is required.' });
  }
  res.json({
    income: Number(income),
    needs: Math.round(income * needs_pct / 100),
    wants: Math.round(income * wants_pct / 100),
    savings: Math.round(income * savings_pct / 100),
    breakdown: { needs_pct, wants_pct, savings_pct }
  });
});

// ── Investment Return Calculator ────────────────────────
router.post('/investment', (req, res) => {
  const { principal, monthly_contribution = 0, annual_rate, years } = req.body;
  if (!principal || !annual_rate || !years) {
    return res.status(400).json({ error: 'principal, annual_rate, and years are required.' });
  }

  const r = annual_rate / 100 / 12; // monthly rate
  const n = years * 12;
  // Future value of lump sum + future value of annuity
  const fv_lump = principal * Math.pow(1 + r, n);
  const fv_annuity = monthly_contribution * ((Math.pow(1 + r, n) - 1) / r);
  const total = Math.round(fv_lump + fv_annuity);
  const total_invested = Math.round(Number(principal) + monthly_contribution * n);

  res.json({
    future_value: total,
    total_invested,
    interest_earned: total - total_invested,
    principal: Number(principal),
    monthly_contribution: Number(monthly_contribution),
    annual_rate: Number(annual_rate),
    years: Number(years)
  });
});

// ── Loan Repayment Calculator ───────────────────────────
router.post('/loan', (req, res) => {
  const { principal, annual_rate, months } = req.body;
  if (!principal || !annual_rate || !months) {
    return res.status(400).json({ error: 'principal, annual_rate, and months are required.' });
  }

  const r = annual_rate / 100 / 12;
  const payment = r > 0
    ? Math.round(principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1))
    : Math.round(principal / months);
  const total_paid = payment * months;

  res.json({
    monthly_payment: payment,
    total_paid,
    total_interest: total_paid - Math.round(Number(principal)),
    principal: Number(principal),
    annual_rate: Number(annual_rate),
    months: Number(months)
  });
});

module.exports = router;
