/**
 * tests/setup.js
 * This file runs automatically before any test file.
 * It sets fake environment variables so our code doesn't crash
 * when it tries to read .env values that don't exist during testing.
 */

process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'finfriend_test';
process.env.JWT_EXPIRES_IN = '7d';
