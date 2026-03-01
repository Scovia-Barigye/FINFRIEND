/**
 * FinFriend – Seed Script (demo data)
 * Run:  npm run db:seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./connection');

async function seed() {
  const conn = await pool.getConnection();
  try {
    // ── Demo users ─────────────────────────────────────
    const hash = await bcrypt.hash('password123', 10);
    await conn.query(`INSERT IGNORE INTO users (full_name, email, password_hash, university, role, xp) VALUES
      ('Alice Nambi',   'alice@example.com',   ?, 'Makerere University',       'student', 250),
      ('Brian Ochieng', 'brian@example.com',    ?, 'Kyambogo University',       'student', 180),
      ('Dr. Sarah K.',  'sarah@example.com',    ?, 'Makerere University',       'expert',  500),
      ('Admin',         'admin@finfriend.com',  ?, 'FinFriend',                 'admin',   999)
    `, [hash, hash, hash, hash]);

    // ── Modules ────────────────────────────────────────
    await conn.query(`INSERT IGNORE INTO modules (title, slug, description, category, difficulty, content_html, xp_reward) VALUES
      ('Budgeting 101', 'budgeting-101',
       'Learn the basics of budgeting and how to create your first personal budget.',
       'budgeting', 'beginner',
       '<h2>What is a Budget?</h2><p>A budget is a financial plan that helps you track income and expenses. As a student in Uganda, managing your money wisely is the first step to financial freedom.</p><h3>Step 1 – List your income</h3><p>Include allowances, part-time work, bursaries, and any other money you receive.</p><h3>Step 2 – List your expenses</h3><p>Track everything: tuition, rent, food, transport (boda-bodas!), airtime, data, and entertainment.</p><h3>Step 3 – The 50/30/20 Rule</h3><p><strong>50%</strong> of income → Needs (rent, food, tuition)</p><p><strong>30%</strong> → Wants (entertainment, eating out)</p><p><strong>20%</strong> → Savings &amp; debt repayment</p><h3>Tips for Ugandan Students</h3><ul><li>Use mobile money to separate savings from spending.</li><li>Cook at home instead of eating at restaurants.</li><li>Walk or share transport when possible.</li></ul>', 15),

      ('Saving Strategies', 'saving-strategies',
       'Discover practical saving strategies tailored for university students.',
       'saving', 'beginner',
       '<h2>Why Save?</h2><p>An emergency fund protects you from unexpected costs like medical bills or laptop repairs.</p><h3>Practical Tips</h3><ul><li>Open a savings account with low fees (many Ugandan banks offer student accounts).</li><li>Use mobile money lock features to avoid impulse spending.</li><li>Start small — even UGX 5,000/week adds up!</li></ul><h3>The Power of Compound Interest</h3><p>If you save UGX 20,000 per week at 10% annual interest, in 4 years you will have saved over UGX 5,000,000.</p>', 15),

      ('Investing Basics', 'investing-basics',
       'An introduction to investing for students — stocks, bonds, SACCOs, and more.',
       'investing', 'intermediate',
       '<h2>Investing vs Saving</h2><p>Saving preserves money; investing grows it. As a young person, time is your greatest asset.</p><h3>Investment Options in Uganda</h3><ul><li><strong>SACCOs</strong> – Savings and Credit Cooperative Organisations offer good returns.</li><li><strong>Treasury Bills</strong> – Government securities available via Bank of Uganda.</li><li><strong>Unit Trusts</strong> – Managed funds like those from UAP Old Mutual.</li><li><strong>Stocks</strong> – Buy shares on the Uganda Securities Exchange (USE).</li></ul><h3>Risk vs Return</h3><p>Higher potential return = higher risk. Diversify your investments to reduce risk.</p>', 25),

      ('Credit & Debt Management', 'credit-management',
       'Understand credit, avoid debt traps, and learn responsible borrowing.',
       'credit', 'intermediate',
       '<h2>Understanding Credit</h2><p>Credit is borrowed money you promise to repay. It can be helpful or harmful depending on how you use it.</p><h3>Good Debt vs Bad Debt</h3><p><strong>Good debt</strong> builds value — e.g., student loans for education.</p><p><strong>Bad debt</strong> loses value — e.g., borrowing for parties or luxury items.</p><h3>Avoiding Debt Traps</h3><ul><li>Avoid loan apps with hidden high interest rates.</li><li>Only borrow what you can repay.</li><li>Read the fine print before signing anything.</li></ul>', 25),

      ('Mobile Money Mastery', 'mobile-money',
       'Master mobile money platforms like MTN MoMo and Airtel Money for smart financial management.',
       'general', 'beginner',
       '<h2>Mobile Money in Uganda</h2><p>Uganda is one of the leading mobile money markets in Africa. Learning to use it wisely is essential.</p><h3>Tips</h3><ul><li>Track all transactions in a notebook or app.</li><li>Use savings wallets to earn interest.</li><li>Beware of scam calls asking for your PIN.</li><li>Set transaction limits to control spending.</li></ul>', 10)
    `);

    // ── Quizzes ────────────────────────────────────────
    await conn.query(`INSERT IGNORE INTO quizzes (module_id, question, option_a, option_b, option_c, option_d, correct) VALUES
      (1, 'What percentage of income should go to needs in the 50/30/20 rule?', '20%', '30%', '50%', '70%', 'c'),
      (1, 'Which of these is a "want" rather than a "need"?', 'Rent', 'Tuition', 'Netflix subscription', 'Food', 'c'),
      (2, 'What does compound interest do?', 'Decreases your savings', 'Earns interest on interest', 'Charges you fees', 'Keeps money the same', 'b'),
      (3, 'Which is a low-risk investment in Uganda?', 'Cryptocurrency', 'Treasury Bills', 'Forex trading', 'Sports betting', 'b'),
      (4, 'What is an example of good debt?', 'Borrowing for a party', 'A payday loan for shopping', 'A student loan for education', 'Credit card for clothes', 'c'),
      (5, 'What should you NEVER share with anyone regarding mobile money?', 'Your phone number', 'Your name', 'Your PIN', 'Your network provider', 'c')
    `);

    // ── Forum Categories ───────────────────────────────
    await conn.query(`INSERT IGNORE INTO forum_categories (name, slug, icon) VALUES
      ('Budgeting Tips',      'budgeting-tips',      '💰'),
      ('Saving & Investing',  'saving-investing',    '📈'),
      ('Student Life',        'student-life',        '🎓'),
      ('Side Hustles',        'side-hustles',        '💼'),
      ('General Discussion',  'general',             '💬')
    `);

    // ── Sample Forum Threads ───────────────────────────
    await conn.query(`INSERT IGNORE INTO forum_threads (category_id, user_id, title, body, views) VALUES
      (1, 1, 'How do you budget on campus?', 'I get UGX 500,000/month from my parents. How should I split it?', 42),
      (3, 2, 'Best student bank accounts in Uganda?', 'Which banks have the best deals for students? I want low fees and a savings option.', 31),
      (4, 1, 'Freelancing as a student', 'Has anyone tried freelancing on Upwork or Fiverr while studying? Any tips?', 58)
    `);

    await conn.query(`INSERT IGNORE INTO forum_replies (thread_id, user_id, body) VALUES
      (1, 2, 'I use the 50/30/20 rule! 250k for needs, 150k for wants, 100k for savings.'),
      (1, 3, 'Great question! I recommend tracking expenses for a month first before setting a budget.'),
      (2, 1, 'Stanbic has a student account with no monthly fees. Centenary Bank is also good.')
    `);

    // ── Blog Posts ──────────────────────────────────────
    await conn.query(`INSERT IGNORE INTO blog_posts (author_id, title, slug, excerpt, body_html, published) VALUES
      (3, '5 Money Mistakes Every Ugandan Student Makes', 'money-mistakes-students',
       'Avoid these common financial pitfalls during your university years.',
       '<p>University is exciting, but it is also where many students develop bad money habits. Here are five mistakes to avoid:</p><ol><li><strong>No budget</strong> – Flying blind with your finances.</li><li><strong>Impulse spending</strong> – That new outfit can wait.</li><li><strong>Ignoring mobile money fees</strong> – Small fees add up over a semester.</li><li><strong>Not saving anything</strong> – Even UGX 5,000/week matters.</li><li><strong>Borrowing from loan apps</strong> – Interest rates can exceed 30%!</li></ol><p>Start small, be consistent, and your future self will thank you.</p>', TRUE),

      (3, 'How to Start Investing with UGX 50,000', 'start-investing-50k',
       'You do not need millions to start investing. Here is how to begin with just 50,000 UGX.',
       '<p>Many students think investing is only for the wealthy. That is a myth! Here are ways to start small:</p><ul><li>Join a SACCO – many have entry fees as low as UGX 20,000.</li><li>Buy Treasury Bills – minimum investment is UGX 100,000, so save up for two months.</li><li>Start a small business – buy and resell items on campus.</li></ul><p>The key is to start now and be patient. Time in the market beats timing the market.</p>', TRUE)
    `);

    // ── Badges ─────────────────────────────────────────
    await conn.query(`INSERT IGNORE INTO badges (name, description, icon, xp_required) VALUES
      ('First Steps',       'Complete your first module',              '🌱', 10),
      ('Budget Boss',       'Complete all budgeting modules',          '💰', 50),
      ('Savings Star',      'Complete all saving modules',             '⭐', 50),
      ('Investor',          'Complete an investing module',            '📈', 25),
      ('Community Helper',  'Post 5 replies in the forum',            '🤝', 0),
      ('Knowledge Seeker',  'Complete 5 modules',                     '📚', 75),
      ('Finance Guru',      'Earn 500 XP',                            '🏆', 500),
      ('Streak Master',     'Log expenses for 7 consecutive days',    '🔥', 0)
    `);

    // Give demo user a badge
    await conn.query(`INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (1, 1)`);

    console.log('✅  Seed data inserted successfully!');
  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
