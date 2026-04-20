/**
 * tests/tools.test.js
 *
 * These tests check our three financial calculators:
 *   - Budget Planner      (POST /api/tools/budget)
 *   - Investment Returns  (POST /api/tools/investment)
 *   - Loan Repayment      (POST /api/tools/loan)
 *
 * Why start here? Because routes/tools.js has NO database calls.
 * It is pure math, which makes it the easiest and most reliable module to test.
 *
 * We use two helper libraries:
 *   - supertest: lets us send fake HTTP requests without starting the real server
 *   - express:   lets us create a mini test app with just the tools routes
 */

const request = require('supertest');
const express = require('express');
const toolRoutes = require('../routes/tools');

// Build a tiny Express app just for testing.
// We do NOT use the full server.js because that would try to start on port 3000
// and connect to the database, which we don't need here.
const app = express();
app.use(express.json());
app.use('/api/tools', toolRoutes);


// ════════════════════════════════════════════════════════
// BUDGET CALCULATOR TESTS
// ════════════════════════════════════════════════════════

describe('Budget Calculator - POST /api/tools/budget', () => {

  // ── Happy Path Tests ──────────────────────────────────

  test('TC-B01: should return 200 and correct breakdown for valid income', async () => {
    // Send 500,000 UGX using default 50/30/20 split
    const response = await request(app)
      .post('/api/tools/budget')
      .send({ income: 500000 });

    expect(response.status).toBe(200);
    expect(response.body.income).toBe(500000);
    expect(response.body.needs).toBe(250000);   // 50% of 500,000
    expect(response.body.wants).toBe(150000);   // 30% of 500,000
    expect(response.body.savings).toBe(100000); // 20% of 500,000
  });

  test('TC-B02: should use custom percentages when all three are provided', async () => {
    // Use a 60/25/15 split instead of the default 50/30/20
    const response = await request(app)
      .post('/api/tools/budget')
      .send({ income: 1000000, needs_pct: 60, wants_pct: 25, savings_pct: 15 });

    expect(response.status).toBe(200);
    expect(response.body.needs).toBe(600000);   // 60% of 1,000,000
    expect(response.body.wants).toBe(250000);   // 25%
    expect(response.body.savings).toBe(150000); // 15%
  });

  // ── Validation / Error Tests ──────────────────────────

  test('TC-B03: should return 400 when income is missing from the request', async () => {
    // Sending an empty body — income is required
    const response = await request(app)
      .post('/api/tools/budget')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined(); // an error message must exist
  });

  test('TC-B04: should return 400 when income is zero (boundary condition)', async () => {
    // Zero is the boundary between invalid (<=0) and valid (>0)
    const response = await request(app)
      .post('/api/tools/budget')
      .send({ income: 0 });

    expect(response.status).toBe(400);
  });

  test('TC-B05: should return 400 when income is negative', async () => {
    // Negative income is not meaningful for a budget
    const response = await request(app)
      .post('/api/tools/budget')
      .send({ income: -50000 });

    expect(response.status).toBe(400);
  });
});


// ════════════════════════════════════════════════════════
// INVESTMENT CALCULATOR TESTS
// ════════════════════════════════════════════════════════

describe('Investment Calculator - POST /api/tools/investment', () => {

  // ── Happy Path Tests ──────────────────────────────────

  test('TC-I01: should return 200 and a future value that is greater than principal', async () => {
    const response = await request(app)
      .post('/api/tools/investment')
      .send({ principal: 100000, annual_rate: 10, years: 1 });

    expect(response.status).toBe(200);
    // After one year at 10% interest, we should have more than 100,000
    expect(response.body.future_value).toBeGreaterThan(100000);
    expect(response.body.interest_earned).toBeGreaterThan(0);
    expect(response.body.total_invested).toBe(100000); // no monthly contribution
  });

  test('TC-I02: should produce a higher future value when monthly contributions are added', async () => {
    // Run two calculations: same settings, one with monthly contribution and one without
    const withContribution = await request(app)
      .post('/api/tools/investment')
      .send({ principal: 100000, monthly_contribution: 20000, annual_rate: 10, years: 1 });

    const withoutContribution = await request(app)
      .post('/api/tools/investment')
      .send({ principal: 100000, monthly_contribution: 0, annual_rate: 10, years: 1 });

    expect(withContribution.status).toBe(200);
    // Adding 20,000/month should result in a higher final value
    expect(withContribution.body.future_value).toBeGreaterThan(
      withoutContribution.body.future_value
    );
  });

  // ── Validation / Error Tests ──────────────────────────

  test('TC-I03: should return 400 when principal is missing', async () => {
    const response = await request(app)
      .post('/api/tools/investment')
      .send({ annual_rate: 10, years: 5 }); // principal is missing

    expect(response.status).toBe(400);
  });

  test('TC-I04: should return 400 when annual_rate is missing', async () => {
    const response = await request(app)
      .post('/api/tools/investment')
      .send({ principal: 100000, years: 5 }); // annual_rate is missing

    expect(response.status).toBe(400);
  });

  test('TC-I05: should return 400 when years is missing', async () => {
    const response = await request(app)
      .post('/api/tools/investment')
      .send({ principal: 100000, annual_rate: 10 }); // years is missing

    expect(response.status).toBe(400);
  });
});


// ════════════════════════════════════════════════════════
// LOAN REPAYMENT CALCULATOR TESTS
// ════════════════════════════════════════════════════════

describe('Loan Calculator - POST /api/tools/loan', () => {

  // ── Happy Path Tests ──────────────────────────────────

  test('TC-L01: should return 200 and a monthly payment greater than zero', async () => {
    const response = await request(app)
      .post('/api/tools/loan')
      .send({ principal: 2000000, annual_rate: 18, months: 12 });

    expect(response.status).toBe(200);
    expect(response.body.monthly_payment).toBeGreaterThan(0);
    // You should always pay back more than you borrowed (interest is added)
    expect(response.body.total_paid).toBeGreaterThan(2000000);
    expect(response.body.total_interest).toBeGreaterThan(0);
  });

  test('TC-L02: should calculate zero interest correctly (boundary condition)', async () => {
    // At 0% interest, monthly payment = principal / months (simple division)
    // 1,200,000 / 12 months = 100,000 per month
    const response = await request(app)
      .post('/api/tools/loan')
      .send({ principal: 1200000, annual_rate: 0, months: 12 });

    expect(response.status).toBe(200);
    expect(response.body.monthly_payment).toBe(100000);  // 1,200,000 / 12
    expect(response.body.total_interest).toBe(0);         // no interest charged
  });

  // ── Validation / Error Tests ──────────────────────────

  test('TC-L03: should return 400 when principal is missing', async () => {
    const response = await request(app)
      .post('/api/tools/loan')
      .send({ annual_rate: 18, months: 12 }); // principal is missing

    expect(response.status).toBe(400);
  });

  test('TC-L04: should return 400 when annual_rate is missing', async () => {
    const response = await request(app)
      .post('/api/tools/loan')
      .send({ principal: 1000000, months: 12 }); // annual_rate is missing

    expect(response.status).toBe(400);
  });

  test('TC-L05: should return 400 when months is missing', async () => {
    const response = await request(app)
      .post('/api/tools/loan')
      .send({ principal: 1000000, annual_rate: 18 }); // months is missing

    expect(response.status).toBe(400);
  });
});
