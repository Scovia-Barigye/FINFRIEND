# FinFriend – Goal-Based Measurement (GBM) Framework

This document demonstrates how the **Goal-Based Measurement (GBM)** framework is applied in the **FinFriend** financial literacy platform. Following the GBM principle, every metric collected is traceable back to a defined project goal, ensuring that all measurements are meaningful and aligned with project objectives.

> **Core Principle:** Goal → Question → Metric

---

## 1. Determining What to Measure

### Identifying Entities

The first stage of the GBM process identifies the software entities that are important for evaluation in FinFriend.

| Entity | Type | Where in FinFriend |
|--------|------|--------------------|
| User registration & login flow | Process | `routes/auth.js` |
| Quiz submission & scoring | Process | `routes/modules.js` |
| Expense tracking | Process | `routes/dashboard.js` |
| Financial goal management | Process | `routes/dashboard.js` |
| Forum thread & reply creation | Process | `routes/forum.js` |
| Badge award pipeline | Process | `routes/badges.js` |
| Source code (route modules) | Product | `routes/` directory (8 files) |
| Database schema | Product | `db/init.js` (11 tables) |
| Financial calculator functions | Product | `routes/tools.js` |
| Development team | Resource | Project contributors |
| MySQL database & Node.js runtime | Resource | `db/connection.js`, `server.js` |
| Express + JWT middleware | Resource | `middleware/auth.js`, `server.js` |

### Classifying Entities

#### Process Entities

A process is a collection of software-related activities performed over time.

| Process | Activity | Code Location |
|---------|----------|---------------|
| **Software Development** | Building route handlers, middleware, DB schema | All `routes/`, `db/`, `middleware/` files |
| **Software Testing** | Quiz grading logic, input validation | `routes/modules.js` – `percentage >= 60` check |
| **Configuration Management** | Environment variables, rate limiting, CORS | `server.js` – `rateLimit`, `dotenv` |
| **Reuse Processes** | Shared `authMiddleware` applied across 6 route files | `middleware/auth.js` – `authMiddleware`, `requireRole` |

Example process measures observed in FinFriend:

- **Development effort** – tracked as RE/MRE in the companion `METRICS_README.md`
- **Elapsed time** – `created_at TIMESTAMP` on every table in `db/init.js`
- **Process compliance** – JWT auth enforced on every protected route via `authMiddleware`
- **Test process volume** – 6 quiz questions spread across 5 modules

#### Product Entities

A product refers to any artifact or deliverable produced during development.

| Product | Measure | Code Location |
|---------|---------|---------------|
| Source code | 8 route modules, ~450 lines total | `routes/` directory |
| Database schema | 11 tables defined | `db/init.js` |
| Financial calculators | 3 calculator functions (budget, investment, loan) | `routes/tools.js` |
| Quiz content | 6 questions across 5 modules | `db/seed.js`, `db/init.js` |
| Blog posts | 2 published articles | `routes/blog.js`, `blog_posts` table |
| Badges catalogue | 7 badges with XP thresholds | `routes/badges.js`, `badges` table |

Example product measures observed in FinFriend:

- **Lines of code** – `routes/tools.js` is the smallest (zero DB dependency), `routes/forum.js` and `routes/dashboard.js` are the largest
- **Number of modules** – 8 route files, each handling one feature domain
- **Defect density** – target ≤ 3 bugs per module (see Section 8 of `METRICS_README.md`)
- **Percentage of reused code** – `authMiddleware` from `middleware/auth.js` is reused in `badges.js`, `modules.js`, `dashboard.js`, `forum.js`, `blog.js`, and `users.js`

#### Resource Entities

Resources are entities required to perform process activities.

| Resource | Measure | Where in FinFriend |
|----------|---------|-------------------|
| Node.js + Express | Tool version & configuration | `package.json`, `server.js` |
| MySQL database | 11 tables, connection pooling | `db/connection.js` |
| JWT library (`jsonwebtoken`) | Auth token lifetime (`7d`) | `routes/auth.js` – `expiresIn` |
| Rate limiter | 200 requests per 15-minute window | `server.js` – `rateLimit` config |
| bcrypt | Password hashing (cost factor 10) | `routes/auth.js` – `bcrypt.hash(password, 10)` |

---

## 2. Determining How to Measure

### Identifying Metrics and Assigning Them to Entities

Once entities were identified, appropriate measurement methods were defined and mapped.

| Entity | Attribute Measured | Metric | Code Evidence |
|--------|-------------------|--------|---------------|
| `users` table | Learning progress | `modules_completed / total_modules × 100` | `routes/dashboard.js` – `progress.filter(p => p.completed).length` |
| `user_progress` table | Quiz effectiveness | `(score / quizzes.length) × 100` | `routes/modules.js` – `percentage` variable |
| `users` table | Gamification engagement | XP accumulated per user | `routes/modules.js` – `UPDATE users SET xp = xp + ?` |
| `user_badges` table | Badge density | `Total badges earned / Total users` | `routes/badges.js` – `POST /check` endpoint |
| `forum_threads` table | Community health | `Threads with replies / Total threads × 100` | `routes/forum.js` – `reply_count` sub-query |
| `forum_threads` table | Content popularity | `views` counter per thread | `routes/forum.js` – `UPDATE forum_threads SET views = views + 1` |
| `expenses` table | Financial tracking | Spending per category (last 30 days) | `routes/dashboard.js` – `DATE_SUB(CURDATE(), INTERVAL 30 DAY)` |
| `goals` table | Savings behaviour | `saved_amount / target_amount × 100` | `routes/dashboard.js` – `PUT /goals/:id` |
| Tools API | Calculator reliability | `HTTP 200 / (200 + 400) × 100` | `routes/tools.js` – all three calculators return 400 on bad input |

---

## 3. Internal and External Attributes

### Internal Attributes

Internal attributes are measurable directly from the entity itself.

| Internal Attribute | Entity | Code Location |
|--------------------|--------|---------------|
| **Size of code** | Route modules | `routes/tools.js` (no DB calls), `routes/dashboard.js` (largest) |
| **Number of tables** | Database schema | 11 tables in `db/init.js` |
| **Number of dependencies** | Each route module | `routes/tools.js` — 1 dep (express); `routes/auth.js` — 4 deps (express, db, bcrypt, jwt) |
| **Number of endpoints** | Each route file | `routes/dashboard.js` — 7 endpoints; `routes/forum.js` — 6 endpoints |
| **XP reward value** | `modules` table | `xp_reward INT DEFAULT 10` in `db/init.js` |
| **Pass threshold** | Quiz logic | Hardcoded `>= 60` in `routes/modules.js` |

### External Attributes

External attributes describe how the entity behaves in relation to its environment.

| External Attribute | How It Manifests in FinFriend | Code Evidence |
|--------------------|-------------------------------|---------------|
| **Quality** | Input validation before DB writes; 400 errors on missing fields | `routes/tools.js` – `if (!income \|\| income <= 0)` |
| **Reliability** | JWT expiry check on every protected request | `middleware/auth.js` – `jwt.verify(token, process.env.JWT_SECRET)` |
| **Usability** | Calculators return structured JSON with labelled fields | `routes/tools.js` – `needs`, `wants`, `savings`, `breakdown` |
| **Performance** | Rate limiter prevents abuse (200 req / 15 min) | `server.js` – `rateLimit` middleware |
| **Security** | Passwords hashed with bcrypt; role-based access via `requireRole` | `routes/auth.js`, `middleware/auth.js` |

---

## 4. Goal-Question-Metric (GQM) Application

Each goal drives questions, and each question drives a concrete metric implemented in the codebase.

### Goal 1 – Improve Financial Literacy Outcomes

**Goal:** Ensure users learn effectively from the module content.

| Question | Metric | Formula | Code Location |
|----------|--------|---------|---------------|
| What percentage of users pass the quiz? | **Quiz Pass Rate** | `Passed / Total Attempted × 100` | `routes/modules.js` – `const passed = percentage >= 60` |
| How much XP do users earn after completing a module? | **XP per Module** | `xp_reward` value per module | `db/init.js` – `xp_reward INT DEFAULT 10` |
| Are users returning to track their progress? | **Module Completion Rate** | `completed_modules / total_modules × 100` | `routes/dashboard.js` – dashboard overview query |

---

### Goal 2 – Increase User Engagement

**Goal:** Keep users active and motivated through gamification and community features.

| Question | Metric | Formula | Code Location |
|----------|--------|---------|---------------|
| How many badges has each user earned? | **Badge Density** | `Total badges earned / Total users` | `routes/badges.js` – `POST /check` awards XP-threshold badges |
| How active is the forum community? | **Forum Reply Rate** | `Threads with replies / Total threads × 100` | `routes/forum.js` – `reply_count` sub-query in `GET /threads` |
| How often do users view forum threads? | **Thread View Count** | `views` integer per thread | `routes/forum.js` – `UPDATE forum_threads SET views = views + 1` |
| Does forum participation earn XP? | **Participation XP** | +2 XP per reply posted | `routes/forum.js` – `UPDATE users SET xp = xp + 2` |

---

### Goal 3 – Support Personal Financial Management

**Goal:** Help users track spending and savings goals meaningfully.

| Question | Metric | Formula | Code Location |
|----------|--------|---------|---------------|
| What are the user's top expense categories? | **Category Spend** | `SUM(amount) GROUP BY category` (last 30 days) | `routes/dashboard.js` – `DATE_SUB(CURDATE(), INTERVAL 30 DAY)` |
| How far along is the user toward their savings goal? | **Goal Progress %** | `saved_amount / target_amount × 100` | `routes/dashboard.js` – `PUT /goals/:id` updates `saved_amount` |

---

### Goal 4 – Ensure System Reliability and Security

**Goal:** Protect user data and prevent system abuse.

| Question | Metric | Formula | Code Location |
|----------|--------|---------|---------------|
| Are API endpoints protected from overuse? | **API Rate Limit** | 200 requests per 15-minute window | `server.js` – `rateLimit({ windowMs: 15*60*1000, max: 200 })` |
| Are all sensitive routes authenticated? | **Auth Coverage** | Count of routes using `authMiddleware` | `middleware/auth.js` used in 6 of 8 route files |
| Are user passwords stored securely? | **Hash Strength** | bcrypt cost factor = 10 | `routes/auth.js` – `bcrypt.hash(password, 10)` |

---

### Goal 5 – Improve Tool Usefulness

**Goal:** Ensure financial calculators return valid, actionable results.

| Question | Metric | Formula | Code Location |
|----------|--------|---------|---------------|
| What percentage of tool requests succeed? | **Tool Completion Rate** | `HTTP 200 / (200 + 400) × 100` | `routes/tools.js` – all three calculators; 400 on invalid input |
| Do tools cover the key financial planning areas? | **Tool Coverage** | 3 tools: budget, investment, loan | `routes/tools.js` – `POST /budget`, `POST /investment`, `POST /loan` |

---

## 5. Basili's GQM Process Applied to FinFriend

Basili's structured methodology defines five steps for collecting software engineering data. Below is how each step maps to FinFriend.

### Step 1 – Developing Corporate, Division, and Project Goals

| Level | Goal | FinFriend Manifestation |
|-------|------|------------------------|
| Project | Teach financial literacy effectively | `modules` table with `difficulty` ENUM, quiz scoring logic in `routes/modules.js` |
| Project | Motivate users through gamification | `badges` + `user_badges` tables; XP system in `users.xp` |
| Project | Foster a learning community | `forum_threads` + `forum_replies` tables in `db/init.js` |
| Project | Track personal finance | `expenses` + `goals` tables; dashboard aggregation in `routes/dashboard.js` |

### Step 2 – Generating Questions That Define Goals Quantifiably

These questions are answered by the GQM table in Section 4 above. Key examples:

- *What % of users pass the quiz?* → Answered by `percentage` in `routes/modules.js`
- *How many badges per user?* → Answered by `POST /api/badges/check`
- *What % of forum threads have replies?* → Answered by `reply_count` sub-query in `routes/forum.js`

### Step 3 – Specifying Metrics Required to Answer the Questions

All metrics are computed directly from SQL queries or arithmetic in the route handlers. No external analytics service is needed because the data model was designed with measurement in mind from the start:

- `quiz_score` column in `user_progress` – stores ratio-scale scores 0–100
- `xp` column in `users` – stores cumulative ratio-scale XP
- `views` column in `forum_threads` – stores ratio-scale view counts
- `DECIMAL(12,2)` for all financial amounts in `expenses` and `goals`

### Step 4 – Developing Mechanisms for Data Collection

| Mechanism | Implementation |
|-----------|---------------|
| Automatic score recording | `INSERT INTO user_progress … ON DUPLICATE KEY UPDATE quiz_score` in `routes/modules.js` |
| Automatic XP accumulation | `UPDATE users SET xp = xp + ?` triggered on quiz pass and forum reply |
| Automatic badge awarding | `POST /api/badges/check` compares `users.xp` to `badges.xp_required` |
| Expense logging | `POST /api/dashboard/expenses` – user-initiated, stored with `expense_date` |
| View counter | Incremented on every `GET /api/forum/threads/:id` request |
| Timestamp logging | `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` on all 11 tables |

### Step 5 – Collecting, Validating, and Analyzing Data / Feedback for Corrective Action

| Feedback Loop | Mechanism | Code Location |
|---------------|-----------|---------------|
| Quiz pass/fail result returned immediately | `res.json({ score, total, percentage, passed })` | `routes/modules.js` |
| Dashboard aggregates all user data in one call | Combined query returns `modules_completed`, `expenses`, `goals`, `badges` | `routes/dashboard.js` – `GET /` |
| Leaderboard ranks users by XP | `ORDER BY xp DESC` enables comparison-based feedback | `routes/users.js` – `GET /leaderboard` |
| Badge awarded triggers client-side feedback | `awarded` array returned to client | `routes/badges.js` – `POST /check` |

---

## 6. GQIM (Goal-Question-Indicator-Metric) Application

GQIM extends GQM by adding **Indicators** – visual or analytical representations of results. The FinFriend dashboard serves as the primary indicator layer.

```
Business Goal
  └─ Measurement Goal
       └─ Question
            └─ Indicator (Dashboard / API Response)
                 └─ Metric (SQL Query / Calculation)
```

### GQIM Step-by-Step for FinFriend

#### Step 1 – Identify Business Goals

| Business Goal | Source in FinFriend |
|---------------|---------------------|
| Improve financial literacy among students | Module system with quiz grading |
| Reduce poor financial decision-making | Budget, investment, and loan calculators |
| Increase student engagement and retention | XP system, badge gamification, forum |
| Provide measurable evidence of learning | Quiz scores stored in `user_progress` |

#### Step 2 – Identify What to Know

To achieve the goals above, the team needed to understand:
- Whether module content leads to correct quiz answers → `quiz_score` in `user_progress`
- Whether users return to use the platform → `completed_at TIMESTAMP` in `user_progress`
- Whether gamification drives participation → `xp` in `users`, `user_badges` table
- Whether financial tools produce valid outputs → HTTP status codes from `routes/tools.js`

#### Step 3 – Identify Subgoals

| Business Goal | Subgoal | Code Manifestation |
|---------------|---------|-------------------|
| Improve literacy | Improve quiz design | `quizzes` table with `option_a`–`option_d` and `correct` ENUM |
| Improve literacy | Offer difficulty progression | `modules.difficulty` ENUM: `beginner → intermediate → advanced` |
| Increase engagement | Improve staff/student performance (XP) | `xp_reward` per module; `+2 XP` per forum reply |
| Increase engagement | Improve quality assurance (badges) | `badges.xp_required` threshold system |

#### Step 4 – Identify Entities and Attributes

| Entity | Relevant Attributes | Code Location |
|--------|---------------------|---------------|
| `users` | `xp`, `role`, `created_at` | `db/init.js` – `users` table |
| `modules` | `category`, `difficulty`, `xp_reward` | `db/init.js` – `modules` table |
| `user_progress` | `completed`, `quiz_score`, `completed_at` | `db/init.js` – `user_progress` table |
| `forum_threads` | `views`, `created_at` | `db/init.js` – `forum_threads` table |
| `expenses` | `category`, `amount`, `expense_date` | `db/init.js` – `expenses` table |
| `goals` | `target_amount`, `saved_amount`, `deadline` | `db/init.js` – `goals` table |
| `badges` | `xp_required`, `name` | `db/init.js` – `badges` table |

#### Step 5 – Formalize Measurement Goals

**Measurement Goal A – Quiz Effectiveness**

| Component | Value |
|-----------|-------|
| **Object of Interest** | Quiz scoring system (`routes/modules.js`) |
| **Purpose** | Evaluate whether module content teaches the subject effectively |
| **Perspective** | Student (sees pass/fail + score) and developer (monitors pass rates) |
| **Environment** | Node.js/Express REST API; MySQL `quizzes` + `user_progress` tables; pass threshold fixed at 60% |

**Measurement Goal B – Gamification Motivation**

| Component | Value |
|-----------|-------|
| **Object of Interest** | XP accumulation and badge award system |
| **Purpose** | Understand whether gamification encourages continued platform use |
| **Perspective** | Student (sees XP on leaderboard and badges on dashboard) |
| **Environment** | `users.xp` integer column; `badges.xp_required` threshold; `POST /api/badges/check` endpoint |

**Measurement Goal C – Financial Tool Reliability**

| Component | Value |
|-----------|-------|
| **Object of Interest** | Budget, investment, and loan calculator endpoints |
| **Purpose** | Determine whether tools provide reliable, valid outputs for users |
| **Perspective** | Student user expecting actionable financial figures |
| **Environment** | Pure Express route handlers with no DB dependency; validated via HTTP status codes (200 / 400) |

#### Step 6 – Identify Quantifiable Questions and Indicators

| Question | Indicator | Where Displayed |
|----------|-----------|-----------------|
| What % of users pass the quiz? | Bar chart of pass/fail per module | `public/dashboard.html` |
| What is the user's XP rank? | Leaderboard position table | `public/leaderboard.html` – ranked by `ORDER BY xp DESC` |
| How is the user spending money? | Category spending breakdown | `public/dashboard.html` – expense pie/bar chart |
| How far toward the savings goal? | Progress bar `saved_amount / target_amount` | `public/dashboard.html` – goals panel |
| Which badges has the user earned? | Badge icon grid with `earned_at` date | `public/dashboard.html` – badges section |

#### Step 7 – Identify Data Elements

| Data Element | Table/Column | Collected By |
|--------------|-------------|--------------|
| Quiz score (0–100) | `user_progress.quiz_score` | `routes/modules.js` – `POST /:slug/quiz` |
| Module completion flag | `user_progress.completed` | `routes/modules.js` – UPSERT on quiz pass |
| Accumulated XP | `users.xp` | `routes/modules.js` and `routes/forum.js` |
| Expense amount + category | `expenses.amount`, `expenses.category` | `routes/dashboard.js` – `POST /expenses` |
| Saved amount | `goals.saved_amount` | `routes/dashboard.js` – `PUT /goals/:id` |
| Badge earned timestamp | `user_badges.earned_at` | `routes/badges.js` – `POST /check` |
| Thread view count | `forum_threads.views` | `routes/forum.js` – incremented on `GET /threads/:id` |

#### Step 8 – Define Measures

| Measure | Scale | Range | Precision | Code Location |
|---------|-------|-------|-----------|---------------|
| **Quiz Score** | Ratio | 0 – 100% | Integer (`Math.round`) | `routes/modules.js` – `Math.round((score / quizzes.length) * 100)` |
| **XP Points** | Ratio | 0 – unlimited | Integer | `users.xp INT DEFAULT 0` in `db/init.js` |
| **Financial Amounts** | Ratio | 0 – 999,999,999.99 | 2 decimal places | `DECIMAL(12,2)` in `expenses` and `goals` tables |
| **Pass Threshold** | Ratio | 60% fixed | N/A | `const passed = percentage >= 60` in `routes/modules.js` |
| **Thread Views** | Ratio | 0 – unlimited | Integer | `views INT DEFAULT 0` in `db/init.js` |
| **XP Badge Threshold** | Ratio | 0 – unlimited | Integer | `badges.xp_required INT DEFAULT 0` in `db/init.js` |
| **Module Difficulty** | Ordinal | beginner < intermediate < advanced | 3-level ENUM | `db/init.js` – `difficulty ENUM('beginner','intermediate','advanced')` |
| **User Role** | Nominal | student, expert, admin | ENUM | `db/init.js` – `role ENUM('student','expert','admin')` |
| **Expense Category** | Nominal | food, transport, rent, … | `VARCHAR(100)` | `expenses.category` in `db/init.js` |

#### Step 9 – Identify Actions to Implement Measures

| Measure | Data Source | Collection Method | Frequency |
|---------|------------|------------------|-----------|
| Quiz score | `quizzes` table + user answers | Automatic on `POST /api/modules/:slug/quiz` | Per quiz submission |
| XP | Module `xp_reward` + 2 per reply | Automatic SQL `UPDATE` in route handlers | Per module completion / per reply |
| Badge award | `badges.xp_required` vs `users.xp` | Triggered by client calling `POST /api/badges/check` | On-demand after XP change |
| Expense category spend | `expenses` table | User-initiated `POST /api/dashboard/expenses` | Per expense entry |
| Goal progress | `goals.saved_amount` | User-initiated `PUT /api/dashboard/goals/:id` | Per goal update |
| API success rate | HTTP 200 vs 400 responses | Implicit in `routes/tools.js` response logic | Per API call |
| Thread engagement | `forum_threads.views`, `forum_replies` count | Automatic increment + reply INSERT | Per thread view / reply |

#### Step 10 – Prepare Measurement Implementation Plan

| Section | Detail |
|---------|--------|
| **Objective** | Collect structured, goal-aligned metrics to evaluate learning outcomes, user engagement, financial tool reliability, and community health in FinFriend |
| **Description** | Metrics are embedded directly into the application's REST API endpoints. Data is stored relationally in MySQL and surfaced through the dashboard API at `GET /api/dashboard` |
| **Implementation** | All collection is automatic and non-intrusive: quiz scores are stored on submission; XP updates on completion events; view counters increment on thread access; expense and goal data is user-entered |
| **Sustained Operations** | The `created_at` timestamp on all 11 tables supports longitudinal analysis. The leaderboard (`GET /api/users/leaderboard`) provides an ongoing ordinal ranking. Rate limiting (`200 req / 15 min`) protects measurement data integrity by preventing artificial inflation |

---

## 7. Summary – GBM Coverage Map

| GBM Concept | Where in FinFriend | Code Location |
|-------------|-------------------|---------------|
| **Identifying Entities (Process)** | Auth flow, quiz submission, badge award pipeline | `routes/auth.js`, `routes/modules.js`, `routes/badges.js` |
| **Identifying Entities (Product)** | 8 route modules, 11 DB tables, 3 calculators | `routes/`, `db/init.js`, `routes/tools.js` |
| **Identifying Entities (Resource)** | JWT, bcrypt, MySQL pool, rate limiter | `middleware/auth.js`, `routes/auth.js`, `server.js`, `db/connection.js` |
| **Internal Attributes** | Code size, dependency count, endpoint count, XP reward value | Route files, `db/init.js` |
| **External Attributes** | Reliability (JWT verify), Quality (input validation), Performance (rate limit) | `middleware/auth.js`, `routes/tools.js`, `server.js` |
| **GQM – Literacy Goal** | Quiz Pass Rate, Module Completion Rate, XP per Module | `routes/modules.js` |
| **GQM – Engagement Goal** | Badge Density, Forum Reply Rate, Thread Views, Participation XP | `routes/badges.js`, `routes/forum.js` |
| **GQM – Finance Goal** | Category Spend, Goal Progress % | `routes/dashboard.js` |
| **GQM – Reliability Goal** | API Rate Limit, Auth Coverage, Hash Strength | `server.js`, `middleware/auth.js`, `routes/auth.js` |
| **GQM – Tool Goal** | Tool Completion Rate, Tool Coverage | `routes/tools.js` |
| **Basili Step 4 (Data Collection)** | Auto-score, auto-XP, view counter, timestamp logging | `routes/modules.js`, `routes/forum.js`, `db/init.js` |
| **Basili Step 5 (Feedback Loop)** | Dashboard API, leaderboard, quiz result response | `routes/dashboard.js`, `routes/users.js`, `routes/modules.js` |
| **GQIM Measurement Goal A** | Quiz effectiveness measurement | `routes/modules.js` – `percentage`, `passed` |
| **GQIM Measurement Goal B** | Gamification motivation measurement | `routes/badges.js`, `users.xp` |
| **GQIM Measurement Goal C** | Financial tool reliability measurement | `routes/tools.js` – HTTP 200/400 |
| **Measurement Goal Structure (Object)** | Each route module as the measured entity | All `routes/*.js` files |
| **Measurement Goal Structure (Purpose)** | Evaluate, understand, improve specific behaviours | Defined per goal in Section 6, Step 5 |
| **Measurement Goal Structure (Perspective)** | Student, developer, admin viewpoints | Dashboard, leaderboard, role-based access |
| **Measurement Goal Structure (Environment)** | Node.js, Express, MySQL, JWT, bcrypt | `server.js`, `db/connection.js`, `middleware/auth.js` |
