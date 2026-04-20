# FinFriend – Empirical Investigation Framework

This document demonstrates how the **Principles of Empirical Software Engineering** are applied throughout the FinFriend financial literacy platform. Each principle is traced directly to specific files and line numbers in the codebase.

---

## Principle 1 – State a Clear, Testable Hypothesis

A well-formed empirical study must define its independent variable (the treatment being introduced) and its dependent variables (the outcomes expected to change) before data collection begins.

In FinFriend, the hypothesis is encoded in two places.

### `public/about.html` – Lines 44–55

```html
<h2>The Problem</h2>
<p>Financial illiteracy leads to:</p>
<ul>
  <li>Poor budgeting and overspending during university</li>
  <li>Falling victim to predatory loan apps</li>
  <li>Inability to save or invest for the future</li>
  <li>Financial stress that affects academic performance</li>
</ul>

<h2>Our Solution</h2>
<p>FinFriend provides: Interactive Modules... Personalized Dashboard... Financial Calculators...</p>
```

The problem list on the left represents the **dependent variables** — the conditions expected to diminish as a result of the intervention. The solution list on the right represents the **independent variable** — the platform itself. In empirical SE terms, this formulates the research question: *"Does engagement with FinFriend's modules, tools, and community reduce symptoms of financial illiteracy among Ugandan university students?"*

### `public/index.html` – Hero Stats Section

```html
<div class="stat-value">5+</div><div class="stat-label">Learning Modules</div>
<div class="stat-value">3</div><div class="stat-label">Financial Tools</div>
<div class="stat-value">8</div><div class="stat-value">Badges</div>
```

A hypothesis only becomes testable when the **dose of the treatment** is precisely defined. By stating that the intervention consists of 5+ modules, 3 calculators, and 8 badges, the team has quantified the scope of their independent variable before a single user interacts with the platform. This is the foundational requirement for any measurable claim.

---

## Principle 2 – Pick the Right Investigation Technique

Different empirical techniques suit different research contexts. Controlled experiments, case studies, surveys, and action research are not interchangeable.

FinFriend's architecture confirms it is a **case study** — an observation of a system operating in a realistic, naturalistic context — rather than a controlled experiment.

### Evidence 1 – `README.md` – Setup Instructions (db:seed Step)

```bash
npm run db:init
npm run db:seed
```

The existence of a seed script means the researchers populate the database with representative realistic data before real users arrive. This is characteristic of a case study environment where the goal is to document activity in a realistic context rather than a controlled laboratory setting.

### Evidence 2 – `server.js` – Lines 7–17

```js
const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const moduleRoutes    = require('./routes/modules');
const dashboardRoutes = require('./routes/dashboard');
const forumRoutes     = require('./routes/forum');
const blogRoutes      = require('./routes/blog');
const badgeRoutes     = require('./routes/badges');
const toolRoutes      = require('./routes/tools');
```

Every user is served the same eight route modules. There is no `groupA` or `groupB` routing logic, and no random assignment to different versions of the platform. This is the precise architecture of a case study: one realistic system, observed naturalistically.

This technique is appropriate because the team cannot ethically withhold financial literacy education from a control group of Ugandan students — which is the same justification used for preferring case studies over controlled trials in real-world educational and public health interventions.

---

## Principle 3 – Control Variables and Avoid Confounders

The most dangerous threat to validity in an empirical study is an uncontrolled variable that affects outcomes but is mistaken for an effect of the treatment.

Two confounders are explicitly controlled in FinFriend.

### Confounder 1 – Institutional Background: `public/register.html` – Lines 34–43

```html
<select id="university" class="form-control" required>
  <option value="">Select your university…</option>
  <option>Makerere University</option>
  <option>Kyambogo University</option>
  <option>Kampala International University</option>
  <option>Uganda Christian University</option>
  <option>Nkumba University</option>
  <option>Other</option>
</select>
```

A student from Makerere University may have had more prior financial education exposure than one from a smaller institution. Without capturing this, any difference in quiz scores could be attributed to the platform's teaching effectiveness when it actually reflects pre-existing knowledge.

Making `university` a **required field at registration** means this confounder is recorded for every data point from day one. It is impossible to analyse a user's quiz score or XP without simultaneously knowing their institution. This implements the measurement guideline of defining contextual attributes alongside outcome attributes — in the same transaction as user creation.

### Confounder 2 – Behavioural Gaming: `server.js` – Lines 26–32

```js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 200,                    // max 200 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);
```

Without rate limiting, a highly motivated student could artificially inflate their XP by rapidly submitting API calls — producing outcome data that does not reflect genuine learning engagement. Rate limiting ensures that the dependent variable (XP as a proxy for learning) cannot be gamed, preserving the integrity of the measurement.

---

## Principle 4 – Design Experiments Carefully (Replication, Randomisation, Local Control)

### Replication – `server.js` Lines 18–19 and `README.md`

```js
const app  = express();
const PORT = process.env.PORT || 3000;
```

Combined with the `.env` template in `README.md` and the `db:init` + `db:seed` scripts, any researcher can clone the repository, reconstruct the environment from scratch, and observe the same system. Replication in empirical SE does not merely mean running the code twice — it means the **conditions can be fully reconstructed**, which these scripts enable.

### Local Control Through Blocking – `public/leaderboard.html` – Lines 62–63

```js
const topClass  = i===0 ? 'top-1' : i===1 ? 'top-2' : i===2 ? 'top-3' : '';
const rankClass = i===0 ? 'gold'  : i===1 ? 'silver': i===2 ? 'bronze': 'other';
```

This ranking logic creates **natural blocks** within the study population: the top 3 users, the top 10 users, and the remaining users form distinct analytical groups. When analysing platform data, treating these groups separately prevents the behaviour of high performers from inflating averages and masking the experience of typical users. This directly implements the blocking principle: group similar units together so their variation does not contaminate the experimental error for other groups.

### Binary Outcome Variable – `public/module.html` – Line 40

```html
<p class="text-muted mb-3">Test your understanding. You need 60% to pass and earn XP.</p>
```

The 60% pass threshold transforms the continuous quiz score into a **binary outcome variable** (pass / fail) that is independent of how long a student spends on the platform. Binary outcome variables reduce noise in dependent variable measurement and make hypothesis testing cleaner, because the event being measured — a threshold being crossed — is unambiguous.

---

## Principle 5 – Define Measures and Counting Rules Up Front

Measures must be defined before data collection begins, not after. Post-hoc measure definition introduces researcher bias into the analysis.

### Quiz Score Formula – `public/module.html` – Lines 127–132

```js
const answers = {};
quizData.forEach(q => {
  const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
  if (selected) answers[q.id] = selected.value;
});
// Result: data.score / data.total = percentage
```

The entity is the quiz attempt, the attribute is correctness per question, the unit is percentage score (0–100), and the counting rule is one answer per question with a 60% threshold. All four components of a complete measure definition — entity, attribute, unit, and counting rule — are specified in the code before any user ever submits a quiz.

### Forum Engagement Unit – `public/forum-thread.html` – Line 123

```js
showToast('Reply posted! +2 XP', 'success');
```

The counting rule for community engagement is explicit: **one reply = 2 XP**. "Community engagement" is not a fuzzy qualitative observation — it has a precise operational definition. The unit is the reply and the weight is 2 XP. A common failure in empirical SE projects is measuring community activity without specifying the unit; FinFriend avoids this entirely.

### Four Primary Dependent Variables – `public/dashboard.html` – Lines 44–63

```html
<div class="stat-value" id="statModules">0/0</div>
<div class="stat-label">Modules Completed</div>

<div class="stat-value" id="statXP">0</div>
<div class="stat-label">Total XP</div>

<div class="stat-value" id="statBadges">0</div>
<div class="stat-label">Badges Earned</div>

<div class="stat-value" id="statGoals">0</div>
<div class="stat-label">Active Goals</div>
```

These four statistics — modules completed, XP, badges earned, and active goals — are the measurement dashboard of the empirical investigation. Their existence as fixed UI elements from the first commit proves they were decided **before data collection began**, not derived retrospectively from whatever happened to accumulate in the database. This is a direct application of the guideline that hypotheses and measures must be stated prior to performing the study.

---

## Principle 6 – Collect Good Quality Data and Analyse Correctly

Data quality requires both completeness (no silent gaps) and accuracy (no corrupted measurements).

### Data Completeness – `server.js` – Lines 41–45

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

The global error handler ensures that failed API calls are **logged rather than silently discarded**. If a quiz submission fails mid-flight, the error is recorded, meaning researchers can audit gaps in the dataset and understand why certain data points are absent. Silent failures are the most dangerous form of data quality problem in empirical studies, because they create invisible holes that are indistinguishable from genuine zero values during analysis.

### Chained Multi-Outcome Measurement – `public/module.html` – Lines 157–158

```js
if (data.passed) {
  await apiFetch('/api/badges/check', { method: 'POST' });
}
```

After a successful quiz submission, the badge checker is called immediately. This ensures that **every qualifying event triggers a cascade of downstream measurements**: not just "did they pass the quiz?" but simultaneously "does this pass trigger a badge milestone?" This is multi-outcome data collection — recording data about other performance measures that may be affected by the same treatment event.

### Passive vs Active Engagement – `public/forum.html` – Lines 139–140

```js
<span>💬 ${t.reply_count} replies</span>
<span>👁 ${t.views} views</span>
```

Views measure **passive engagement** (reading without contributing), while replies measure **active engagement** (contributing to discussion). Separating these two metrics means the data supports richer analysis: for example, testing whether passive readers eventually convert to active contributors — a secondary hypothesis about community growth that is only testable because both variables were collected independently from the start.

---

## Principle 7 – Be Transparent in Presentation and Honest in Interpretation

Transparency requires that methods, raw data, and limitations are all visible to independent reviewers.

### Reproducibility – `README.md`

The `README.md` provides complete setup instructions — environment variables, database initialisation, and seeding — sufficient for any researcher to reconstruct the exact deployment environment from scratch. This satisfies the requirement that raw data and methods be available for independent audit.

### Population Scope – `public/about.html` – Lines 29–32

```html
<h2>Target Audience</h2>
<p>University students (undergraduate and postgraduate) in Uganda,
expanding to the broader East African region...</p>
```

This statement explicitly defines the **population to which conclusions apply**. Any finding derived from FinFriend data cannot be generalised beyond Ugandan university students without further study. Acknowledging scope boundaries honestly is a key requirement of valid empirical interpretation — findings are only valid within the population they were measured on.

### Honest Failure Reporting – `public/404.html` and `server.js` Global Error Handler

The `404.html` page and the global error handler together ensure that when the system cannot deliver a result, it **says so explicitly** rather than returning empty or misleading data. In an empirical investigation, silent failures are more dangerous than explicit ones, because they produce invisible data gaps that are indistinguishable from legitimate zero values during analysis. FinFriend's explicit error states ensure that data gaps are visible and can be accounted for during any analytical review.

---

## Summary

| Principle | File | Key Lines | Empirical Meaning |
|-----------|------|-----------|-------------------|
| **1. Hypothesis** | `public/about.html`, `public/index.html` | Lines 44–55 (about); hero stats (index) | Problem list = dependent variables; platform = independent variable |
| **2. Technique** | `server.js`, `README.md` | Lines 7–17 (server); `db:seed` step | No A/B routing = case study, not controlled experiment |
| **3. Confounders** | `public/register.html`, `server.js` | Lines 34–43 (register); Lines 26–32 (server) | University field captures institutional confounder; rate limit prevents XP gaming |
| **4. Replication / Blocking** | `server.js`, `public/leaderboard.html`, `public/module.html` | Lines 18–19 (server); Lines 62–63 (leaderboard); Line 40 (module) | Reproducible environment; rank-based natural blocks; binary pass/fail outcome |
| **5. Measure Definitions** | `public/dashboard.html`, `public/module.html`, `public/forum-thread.html` | Lines 44–63 (dash); Lines 127–132 (module); Line 123 (thread) | Four stats defined upfront; quiz formula explicit; 2 XP per reply |
| **6. Data Quality** | `server.js`, `public/module.html`, `public/forum.html` | Lines 41–45 (server); Lines 157–158 (module); Lines 139–140 (forum) | Error logging; chained multi-outcome measurement; passive vs active engagement |
| **7. Transparency** | `README.md`, `public/about.html`, `public/404.html` | Target Audience section (about) | Reproducible setup; population scope stated; explicit failure reporting |
