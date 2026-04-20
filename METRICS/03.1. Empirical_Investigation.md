# Empirical Investigation: FinFriend Platform

This document outlines how the FinFriend platform is designed as an empirical investigation into financial literacy among Ugandan university students. It maps specific code implementation details to empirical software engineering (SE) principles.

---

## 1. State a Clear, Testable Hypothesis

The platform encodes its research hypothesis in its descriptive and functional elements.

*   **Logic (about.html, Lines 30–47):** The "Problem" list (financial illiteracy symptoms) represents the **dependent variables**, while the "Solution" list (interactive modules, tools) represents the **independent variable**.
*   **Measurement (index.html, Lines 76–92):** The hero stats ("8 badges", "5+ modules") define the **dosage** of the intervention, making the research question ("Does engagement reduce financial illiteracy?") measurable and testable.

| File | Lines | Empirical Meaning |
| :--- | :--- | :--- |
| `public/about.html` | 30–47 | Problem/Solution mapping (Variables) |
| `public/index.html` | 76–92 | Intervention Dosage |

---

## 2. Pick the Right Investigation Technique

FinFriend is structured as a **Case Study** (research in the typical) rather than a controlled experiment.

*   **Realistic Context (README.md):** The use of `db:seed` to populate the environment with realistic data is characteristic of documenting activity in a naturalistic context.
*   **Single-System Observation (server.js, Lines 7–17):** Every user interacts with the same routes. There is no A/B testing or random assignment, which is ethically appropriate for providing financial education to all participants without withholding treatment from a control group.

| File | Evidence | Empirical Meaning |
| :--- | :--- | :--- |
| `README.md` | `db:seed` step | Realistic context over laboratory control |
| `server.js` | Lines 7–17 | Naturalistic observation (Case Study) |

---

## 3. Control Variables and Avoid Confounders

Confounders are managed through data capture and technical constraints.

*   **Institutional Confounder (register.html, Lines 38–47):** Making the "University" field mandatory at registration ensures that institutional background (a major confounder) is recorded for every data point.
*   **Behavioral Confounder (server.js, Lines 26–32):** Rate limiting prevents students from "gaming" the XP system through rapid API calls, ensuring XP remains a valid proxy for genuine learning.

| File | Implementation | Empirical Meaning |
| :--- | :--- | :--- |
| `public/register.html` | University Selection | Contextual Attribute (DC1) |
| `server.js` | Rate Limiter | Controlling for gaming behavior |

---

## 4. Design Experiments Carefully (Replication & Blocking)

The architecture supports both independent replication and nuanced analysis.

*   **Replication (README.md, server.js):** Environment variables and database scripts allow any researcher to reconstruct an identical experimental environment from scratch.
*   **Local Control / Blocking (leaderboard.html, Lines 37–50):** The ranking system creates natural "blocks" (top performers vs. typical users), allowing for variance analysis that prevents extreme behaviors from contaminating averages.
*   **Binary Outcomes (module.html, Line 55):** The 60% pass threshold creates a binary outcome variable that reduces noise relative to time-spent metrics.

| File | Lines | Empirical Meaning |
| :--- | :--- | :--- |
| `public/leaderboard.html` | 37–50 | Blocking of study population |
| `public/module.html` | 55 | Local control via pass/fail threshold |

---

## 5. Define Measures and Counting Rules Up Front

Metrics are explicitly defined in the platform's logic and interface.

*   **Quiz Measurement (module.html, Lines 112–140):** Defines the correctness unit (percentage) and the counting rule (one answer per question).
*   **Engagement Weighting (forum-thread.html, Line 80):** Explicitly defines the weight of community interaction (1 reply = 2 XP).
*   **Measurement Dashboard (dashboard.html, Lines 38–61):** Primary dependent variables (Modules, XP, Badges, Goals) are defined in the UI, proving they were decided prior to data collection.

| File | Logic | Empirical Meaning |
| :--- | :--- | :--- |
| `public/dashboard.html` | Lines 38-61 | Pre-defined measurement dashboard |
| `public/module.html` | Lines 112-140| DC1: Entity, Attribute, Unit, Rule |
| `public/forum-thread.html` | Line 80 | Precise operational definition of engagement |

---

## 6. Collect Good Quality Data and Analyse Correctly

Mechanisms are in place to ensure data completeness and multi-dimensional analysis.

*   **Completeness Check (server.js, Lines 41–45):** A global error handler ensures failed submissions are logged, allowing researchers to audit gaps in the dataset.
*   **Multi-Outcome Tracking (module.html):** A quiz pass triggers a badge check, reflecting Guideline DC4 by measuring downstream effects of a single treatment.
*   **Granular Engagement (forum.html):** Distinguishing between `views` (passive) and `replies` (active) allows for richer analysis of the user journey.

| File | Mechanism | Empirical Meaning |
| :--- | :--- | :--- |
| `server.js` | Error Logging | Data Completeness auditing |
| `public/module.html` | Chained Badge Check | Multi-outcome data collection (DC4) |
| `public/forum.html` | View vs. Reply counts | Behavioral distinction in analysis |

---

## 7. Be Transparent in Presentation and Honest in Interpretation

Transparency and scope limitations are explicitly stated for independent audit.

*   **Reproducibility (README.md):** Provides full deployment details for independent verification (P3).
*   **Population Boundaries (about.html, Lines 26–34):** Explicitly limits findings to Ugandan university students (I1, I3), preventing over-generalization.
*   **Honest Failure States (404.html):** Explicit error reporting prevents "invisible" data gaps that could bias analysis.

| File | Content | Empirical Meaning |
| :--- | :--- | :--- |
| `README.md` | Setup Instructions | Independent audit / Reproducibility (P3) |
| `public/about.html` | Target Audience | Population scope limitations (I1/I3) |
