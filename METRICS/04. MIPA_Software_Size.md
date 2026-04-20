# FinFriend – Measuring Internal Product Attributes (Software Size)

This document implements the next lecture topic from **SENG 421 Chapter 5: Measuring Internal Product Attributes – Software Size** on the FinFriend codebase.

It maps lecture concepts to concrete artifacts in this project:
- Length-based size (LOC, NCLOC, CLOC)
- Functionality-based size (Function Point style)
- Object Point style sizing (UI-centered)
- Reuse-oriented size measures
- Size-derived productivity/quality indicators

---

## 1) Lecture Concepts Applied

From the lecture, software size is multi-dimensional:

1. **Length** (physical size, e.g., LOC)
2. **Functionality** (what the product does for users)
3. **Complexity** (treated in the separate complexity assignment)
4. **Reuse** (how much of the product is reused)

In FinFriend, we operationalize these with measurable rules and formulas.

---

## 2) Length-Based Measurement (LOC / NCLOC / CLOC)

Lecture formulas:

$$LOC = NCLOC + CLOC$$

$$Comment\ Density = \frac{CLOC}{LOC}$$

### Project measurement scope
Measured JS artifacts:
- backend: `routes/`, `middleware/`, `db/`
- frontend logic: `public/js/`

### Current measured results (project snapshot)

- **Files measured:** 14 JS files
- **LOC (total physical lines):** 1291
- **CLOC (approx comment lines):** 96
- **Blank lines:** 150
- **NCLOC (approx):** 1045

Derived metrics:

$$Comment\ Density \approx \frac{96}{1291} \times 100 \approx 7.4\%$$

$$NCLOC\ Ratio \approx \frac{1045}{1291} \times 100 \approx 80.9\%$$

### Interpretation
- FinFriend has a moderate codebase size for a course project.
- Most size is in executable/non-comment lines, which is expected for active feature code.
- Documentation in code comments exists but can still be increased in complex handlers.

---

## 3) Size by Module (Route-Level Length)

| Route module | LOC | Endpoints | Dependencies |
|---|---:|---:|---:|
| `routes/auth.js` | 81 | 2 | 4 |
| `routes/badges.js` | 56 | 3 | 3 |
| `routes/blog.js` | 36 | 2 | 2 |
| `routes/dashboard.js` | 136 | 8 | 3 |
| `routes/forum.js` | 111 | 5 | 3 |
| `routes/modules.js` | 109 | 5 | 3 |
| `routes/tools.js` | 68 | 3 | 1 |
| `routes/users.js` | 46 | 3 | 3 |

### Interpretation
- `routes/dashboard.js` is the largest module (highest maintenance effort surface).
- `routes/tools.js` is intentionally small and isolated (good modular design for calculators).

---

## 4) Functionality Size (Function Point Style Mapping)

The lecture defines FP in two stages:

1. Compute unadjusted function count (UFC/UFP)
2. Apply Value Adjustment Factor (VAF)

$$FP = UFC \times VAF$$

### FinFriend mapping to FP function classes

- **EI (External Inputs):** state-changing API calls (POST/PUT/DELETE)
- **EO/EQ (Outputs/Inquiries):** retrieval/reporting API calls (GET)
- **ILF (Internal Logical Files):** project-owned DB tables
- **EIF (External Interface Files):** none significant in current version

Observed API footprint:
- GET: 15
- POST: 12
- PUT: 2
- DELETE: 2
- **Total endpoints:** 31

Observed persistent data entities (ILF proxy):
- users, modules, quizzes, user_progress, expenses, goals, forum_categories, forum_threads, forum_replies, blog_posts, badges, user_badges
- **Total ILF-like entities:** 12

### Practical conclusion
Even without full DET/FTR counting, FinFriend has high functional surface for a student project (31 APIs + 12 logical entities), indicating non-trivial functional size.

---

## 5) Value Adjustment Factor (VAF) Context in FinFriend

Lecture VAF uses 14 technical characteristics. FinFriend visibly implements several of them:

- Data communications (HTTP APIs)
- Distributed processing (client/server)
- Performance controls (rate limiting)
- Reusability (shared middleware and helpers)
- Operational ease (centralized server routing)
- Facilitate change (modular route files)

Concrete code anchors:
- API gateway and rate limit: `server.js`
- Route partitioning by domain: `routes/*.js`
- Shared auth middleware: `middleware/auth.js`

This indicates a meaningful technical adjustment context (VAF > baseline neutral assumptions).

---

## 6) Object Point (OP) Style Sizing for UI

Lecture OP uses weighted counts of screens/reports/components, then reuse-adjusted OP:

$$New\ OP = OP \times \frac{100-r}{100}$$

where $r$ is reuse percentage.

### FinFriend UI inventory
Top-level pages in `public/`:
- `index.html`, `about.html`, `login.html`, `register.html`, `dashboard.html`, `modules.html`, `module.html`, `tools.html`, `forum.html`, `forum-thread.html`, `blog.html`, `blog-post.html`, `leaderboard.html`, `profile.html`, `404.html`
- **Total pages/screens:** 15

### Practical OP interpretation
- The project has a broad UI surface for a course platform.
- Multiple operational screens (dashboard, tools, forum, profile, auth) indicate medium-to-high object-point style size.

---

## 7) Reuse Metrics Implementation (Lecture Reuse Section)

Lecture reuse metrics include reuse level/frequency/density.

### Reuse evidence in FinFriend

1. **Shared authentication middleware reuse**
   - Imported in 5 route modules:
     - `routes/badges.js`
     - `routes/dashboard.js`
     - `routes/forum.js`
     - `routes/modules.js`
     - `routes/users.js`

2. **Shared frontend utility reuse**
   - `public/js/app.js` provides reusable utilities (`apiFetch`, `showToast`, auth/nav handling) consumed by multiple pages.

### Reuse ratio example (backend auth middleware)

- Route modules total: 8
- Route modules reusing shared auth middleware: 5

$$Reuse\ Coverage\ (auth) = \frac{5}{8} \times 100 = 62.5\%$$

### Interpretation
- Reuse is substantial and intentional.
- Shared middleware/utilities reduce duplicated logic and keep functional size from exploding linearly.

---

## 8) Size-Derived Indicators (Lecture: size should reflect effort/cost/productivity)

Lecture examples:

$$Productivity = \frac{KLOC}{Person\text{-}Month}$$

$$Quality = \frac{Defects}{KLOC}$$

For FinFriend, these formulas are directly applicable once team effort logs and defect logs are recorded per sprint. This project already has enough size structure (LOC + modules + endpoints + tables) to support those calculations consistently.

---

## 9) Where the Size Is Concentrated (Actionable Findings)

### Largest size contributors
1. `routes/dashboard.js` (largest route module)
2. `routes/forum.js` and `routes/modules.js` (next largest domain modules)
3. `public/` has 15 screen artifacts (high UI breadth)

### Size-control actions
1. Split dashboard concerns into smaller route files if growth continues.
2. Keep shared utilities (`authMiddleware`, `apiFetch`) centralized.
3. Track NCLOC and endpoint growth per sprint as a trend metric.
4. Add coding standards for comment density in high-branch handlers.

---

## 10) Final Lecture-to-Code Mapping

| Lecture concept | FinFriend implementation |
|---|---|
| LOC / NCLOC / CLOC | Measured across 14 JS files; project-level totals reported |
| LOC-derived metrics | Comment density and NCLOC ratio computed |
| Function Point idea | API endpoint and data-entity mapping to EI/EO/EQ/ILF |
| VAF context | Technical characteristics visible in `server.js` + modular routes |
| Object Point idea | 15 UI pages as screen inventory in `public/` |
| Reuse metrics | Shared middleware + shared frontend helper reuse measured |
| Size ↔ effort/cost/productivity | Formulas ready for sprint-level tracking |

---

## Conclusion

The software-size lecture is fully implementable on FinFriend using measurable, auditable project artifacts.

- Length-based size is now quantified.
- Functional size has a defensible API/data mapping.
- UI object-point surface is documented.
- Reuse is measured with concrete ratios.

This gives a practical, evidence-based size baseline for future effort estimation, quality tracking, and project planning.
