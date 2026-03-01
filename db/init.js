/**
 * FinFriend – Database Initialisation Script
 * Run:  npm run db:init
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'finfriend';

async function init() {
  // Connect without selecting a database so we can CREATE it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${DB_NAME}\``);

  // ── Users ──────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      full_name     VARCHAR(120) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      university    VARCHAR(255) DEFAULT NULL,
      avatar_url    VARCHAR(500) DEFAULT '/img/default-avatar.png',
      role          ENUM('student','expert','admin') DEFAULT 'student',
      xp            INT DEFAULT 0,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // ── Financial Literacy Modules ─────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      slug          VARCHAR(255) NOT NULL UNIQUE,
      description   TEXT,
      category      ENUM('budgeting','saving','investing','credit','general') DEFAULT 'general',
      difficulty    ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
      cover_img     VARCHAR(500) DEFAULT '/img/module-default.jpg',
      content_html  LONGTEXT,
      video_url     VARCHAR(500) DEFAULT NULL,
      xp_reward     INT DEFAULT 10,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // ── Quizzes ────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      module_id     INT NOT NULL,
      question      TEXT NOT NULL,
      option_a      VARCHAR(500) NOT NULL,
      option_b      VARCHAR(500) NOT NULL,
      option_c      VARCHAR(500) NOT NULL,
      option_d      VARCHAR(500) NOT NULL,
      correct       ENUM('a','b','c','d') NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── User Module Progress ───────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL,
      module_id     INT NOT NULL,
      completed     BOOLEAN DEFAULT FALSE,
      quiz_score    INT DEFAULT 0,
      completed_at  TIMESTAMP NULL,
      FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
      UNIQUE KEY unique_progress (user_id, module_id)
    ) ENGINE=InnoDB
  `);

  // ── Dashboard: Expenses ────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL,
      category      VARCHAR(100) NOT NULL,
      amount        DECIMAL(12,2) NOT NULL,
      description   VARCHAR(500) DEFAULT NULL,
      expense_date  DATE NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── Dashboard: Financial Goals ─────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS goals (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL,
      title         VARCHAR(255) NOT NULL,
      target_amount DECIMAL(12,2) NOT NULL,
      saved_amount  DECIMAL(12,2) DEFAULT 0,
      deadline      DATE DEFAULT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── Forum Categories ───────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id    INT AUTO_INCREMENT PRIMARY KEY,
      name  VARCHAR(120) NOT NULL,
      slug  VARCHAR(120) NOT NULL UNIQUE,
      icon  VARCHAR(60) DEFAULT '💬'
    ) ENGINE=InnoDB
  `);

  // ── Forum Threads ──────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS forum_threads (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      category_id   INT NOT NULL,
      user_id       INT NOT NULL,
      title         VARCHAR(255) NOT NULL,
      body          TEXT NOT NULL,
      views         INT DEFAULT 0,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── Forum Replies ──────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS forum_replies (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      thread_id     INT NOT NULL,
      user_id       INT NOT NULL,
      body          TEXT NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── Blog Posts (Expert Insights) ───────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      author_id     INT NOT NULL,
      title         VARCHAR(255) NOT NULL,
      slug          VARCHAR(255) NOT NULL UNIQUE,
      excerpt       VARCHAR(500) DEFAULT NULL,
      body_html     LONGTEXT NOT NULL,
      cover_img     VARCHAR(500) DEFAULT '/img/blog-default.jpg',
      published     BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // ── Badges ─────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS badges (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(120) NOT NULL,
      description   VARCHAR(500) DEFAULT NULL,
      icon          VARCHAR(60) DEFAULT '🏆',
      xp_required   INT DEFAULT 0
    ) ENGINE=InnoDB
  `);

  // ── User Badges ────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL,
      badge_id      INT NOT NULL,
      earned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE KEY unique_badge (user_id, badge_id)
    ) ENGINE=InnoDB
  `);

  console.log('✅  Database and tables created successfully!');
  await conn.end();
}

init().catch(err => {
  console.error('❌  DB init failed:', err.message);
  process.exit(1);
});
