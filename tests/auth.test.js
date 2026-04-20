/**
 * tests/auth.test.js
 *
 * These tests check the INPUT VALIDATION in the register and login routes.
 *
 * Important note: We are ONLY testing what happens when required fields are missing.
 * That's because those checks happen BEFORE any database call is made.
 * This means we can run these tests without a real MySQL database.
 *
 * We use jest.mock() to replace the database module with a fake one.
 * This tells Jest: "whenever the code tries to use db/connection,
 * give it this fake object instead of the real one."
 */

const request = require('supertest');
const express = require('express');

// IMPORTANT: This mock must be declared BEFORE requiring the route files.
// It replaces the real database pool with a fake object.
jest.mock('../db/connection', () => ({
  query: jest.fn() // a fake function that does nothing by default
}));

const authRoutes = require('../routes/auth');

// Build a mini test app with just the auth routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);


// ════════════════════════════════════════════════════════
// REGISTER ROUTE - VALIDATION TESTS
// These test that missing fields are caught and rejected
// ════════════════════════════════════════════════════════

describe('Register Route - Input Validation (POST /api/auth/register)', () => {

  test('TC-R01: should return 400 when full_name is not provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        // full_name is missing
        email: 'alice@makerere.ac.ug',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    // The error message should mention something about requirements
    expect(response.body.error).toContain('required');
  });

  test('TC-R02: should return 400 when email is not provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Alice Nambi',
        // email is missing
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('TC-R03: should return 400 when password is not provided', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Alice Nambi',
        email: 'alice@makerere.ac.ug'
        // password is missing
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('TC-R04: should return 400 when all fields are missing (empty body)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({}); // completely empty

    expect(response.status).toBe(400);
  });
});


// ════════════════════════════════════════════════════════
// LOGIN ROUTE - VALIDATION TESTS
// ════════════════════════════════════════════════════════

describe('Login Route - Input Validation (POST /api/auth/login)', () => {

  test('TC-L01: should return 400 when email is not provided', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' }); // email is missing

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('TC-L02: should return 400 when password is not provided', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@makerere.ac.ug' }); // password is missing

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('TC-L03: should return 400 when both fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({}); // nothing at all

    expect(response.status).toBe(400);
  });
});
