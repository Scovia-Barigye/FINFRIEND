# FinFriend – Software Measurement Metrics

This document provides an overview of the key performance metrics for the **FinFriend** financial literacy platform. These metrics demonstrate the application of objective measurement scales as covered in the lecture on Measurement Theory.

---

## 1. Measurement Scales Applied

| Scale | Attribute Measured | Example in FinFriend | Valid Operations |
|-------|-------------------|----------------------|------------------|
| **Nominal** | Module category | `budgeting`, `saving`, `investing`, `credit`, `general` (ENUM) | Count, Mode |
| **Nominal** | Expense category | `food`, `transport`, `rent` (GROUP BY category) | Count, Mode |
| **Nominal** | User role | `student`, `expert`, `admin` (ENUM) | Count, Mode |
| **Ordinal** | Leaderboard position | Users ranked by XP (`ORDER BY xp DESC`) | Rank, Median |
| **Ordinal** | Module difficulty | `beginner` < `intermediate` < `advanced` (ENUM) | Rank, Median |
| **Interval** | Sign-up / activity dates | `created_at TIMESTAMP` — differences meaningful, no true zero | Difference, Mean |
| **Interval** | Expense date ranges | `DATE_SUB(CURDATE(), INTERVAL 30 DAY)` | Difference, Mean |
| **Ratio** | Quiz scores | 0–100% (`score / total × 100`) — true zero, all arithmetic valid | All (+, −, ×, ÷) |
| **Ratio** | XP points | Integer starting at 0 — twice the XP = twice the progress | All (+, −, ×, ÷) |
| **Ratio** | Financial amounts | `DECIMAL(12,2)` — UGX 0 is true zero, ratios meaningful | All (+, −, ×, ÷) |

---

## 2. Feature Metrics (GQM Paradigm)

| Metric | Goal | Question | Formula | Scale |
|--------|------|----------|---------|-------|
| **Quiz Pass Rate** | Modules teach effectively | What % of users pass the quiz? | `Passed / Total Attempted × 100` | Ratio |
| **Daily Active Users (DAU)** | Users engage with the dashboard | How many unique users per day? | `Count(distinct user_id) per day` | Ratio |
| **Tool Completion Rate** | Calculators are useful | What % of requests return valid results? | `HTTP 200 / (200 + 400) × 100` | Ratio |
| **Badge Density** | Gamification motivates users | How many badges per user on average? | `Total badges earned / Total users` | Ratio |
| **Forum Reply Rate** | Forum fosters discussion | What % of threads have ≥ 1 reply? | `Threads with replies / Total threads × 100` | Ratio |

---

## 3. User Metrics

| Metric | Scale Type | Value (Seed Data) |
|--------|------------|-------------------|
| Total Registered Users | Absolute | 4 users |
| Role Distribution | Nominal | Student: 2, Expert: 1, Admin: 1 |
| XP Range | Ratio | 180 – 999 XP |
| User Retention Indicator | Ratio | Tracked via `user_progress` completions |

---

## 4. Content & Interaction Metrics

| Metric | Scale Type | Value (Seed Data) |
|--------|------------|-------------------|
| Total Modules | Absolute | 5 modules |
| Module Categories | Nominal | Budgeting: 1, Saving: 1, Investing: 1, Credit: 1, General: 1 |
| Total Quiz Questions | Absolute | 6 questions (across 5 modules) |
| Pass Threshold | Ratio | ≥ 60% score |
| Forum Threads | Absolute | 3 threads |
| Forum Replies | Absolute | 3 replies |
| Avg. Thread Views | Ratio | ~43.7 views |
| Blog Posts Published | Absolute | 2 articles |
| Total Badges Available | Absolute | 7 badges |

---

## 5. System & Architecture Metrics

| Metric | Scale Type | Value |
|--------|------------|-------|
| API Rate Limit | Ratio | 200 requests per 15 min window |
| Route Modules | Absolute | 8 route files |
| Database Tables | Absolute | 11 tables |
| Auth Mechanism | Nominal | JWT (Bearer token) |

---

## 6. Object-Oriented Metrics (Coupling & Cohesion)

| Module | Dependencies | Coupling Level | Cohesion |
|--------|-------------|----------------|----------|
| `routes/tools.js` | express | Very Low ✅ | High — only financial calculators |
| `routes/badges.js` | express, db, auth | Moderate | High — only badge logic |
| `routes/modules.js` | express, db, auth | Moderate | High — only module/quiz logic |
| `routes/dashboard.js` | express, db, auth | Moderate | High — only dashboard data |
| `routes/forum.js` | express, db, auth | Moderate | High — only forum operations |
| `routes/blog.js` | express, db, auth | Moderate | High — only blog operations |
| `routes/auth.js` | express, db, bcrypt, jwt | Higher (justified) | High — only authentication |
| `middleware/auth.js` | jsonwebtoken | Very Low ✅ | High — only JWT verification |

---

## 7. Prediction System – Development Effort (RE / MRE)

$$\text{RE} = \frac{|\text{Actual} - \text{Estimated}|}{\text{Actual}}$$

| Feature | Estimated (days) | Actual (days) | RE |
|---------|-----------------|---------------|------|
| Auth system (register/login) | 3 | 2 | 0.50 |
| Financial calculators | 2 | 2 | 0.00 |
| Forum with replies | 4 | 6 | 0.33 |
| Badge system | 2 | 3 | 0.33 |
| Dashboard + expenses | 5 | 7 | 0.29 |
| **Mean Relative Error (MRE)** | | | **0.29** |

An MRE of **29%** indicates estimates were off by ~29% on average. Target threshold: ≤ 25%.

---

## 8. Deployment Readiness Thresholds

| Metric | Ready Threshold | Action if Below |
|--------|----------------|-----------------|
| Quiz Pass Rate | ≥ 60% per module | Simplify questions or add hints |
| Tool Completion Rate | ≥ 75% | Improve input validation UX |
| Badge Density | ≥ 2.0 badges/user | Lower XP thresholds |
| Defect Density | ≤ 3 bugs per module | Fix critical bugs before launch |
| MRE | ≤ 25% | Improve sprint planning |

---

## Summary

| Measurement Concept | Where in FinFriend | Code Location |
|---------------------|-------------------|---------------|
| Nominal Scale | Module categories, expense categories, user roles | `db/init.js`, `routes/dashboard.js` |
| Ordinal Scale | Leaderboard ranking, module difficulty | `routes/users.js`, `db/init.js` |
| Interval Scale | Timestamps, date-range filters | `db/init.js`, `routes/dashboard.js` |
| Ratio Scale | Quiz scores, XP, financial amounts | `routes/modules.js`, `routes/tools.js` |
| GQM Paradigm | Pass rate, DAU, tool completion, badge density, reply rate | `routes/modules.js`, `routes/dashboard.js`, `routes/tools.js`, `routes/badges.js`, `routes/forum.js` |
| Prediction (RE/MRE) | Development effort estimation | Tracked externally |
| Low Coupling | Independent route modules | `routes/tools.js` (zero DB dependency) |
| High Cohesion | Single-purpose modules | Each route file handles one domain |
