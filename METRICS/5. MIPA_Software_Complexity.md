# FinFriend – Measuring Internal Product Attributes (Software Complexity)

This document implements the **"Measuring Internal Product Attributes: Structural Complexity"** lecture concepts on the FinFriend codebase.

Scope of this implementation:
- Control-flow complexity
- Cyclomatic complexity
- Depth of nesting
- Information flow (fan-in / fan-out)
- Cohesion and coupling at component level
- Architectural (morphological) structure summary

---

## 1) What Was Measured

Following the lecture, complexity is treated as an internal product attribute of software structure:

1. **Control-flow structure** (branching, decisions, nesting)
2. **Data / information flow** (fan-in, fan-out)
3. **Component relationships** (cohesion, coupling)

Measured artifacts in FinFriend:
- Backend route modules: `routes/*.js`
- Auth middleware: `middleware/auth.js`
- App composition: `server.js`

---

## 2) Control-Flow & Size Baseline

### Route-level baseline metrics

| Module | LOC | Endpoints | Dependencies (`require`) |
|---|---:|---:|---:|
| `routes/auth.js` | 81 | 2 | 4 |
| `routes/badges.js` | 56 | 3 | 3 |
| `routes/blog.js` | 36 | 2 | 2 |
| `routes/dashboard.js` | 136 | 8 | 3 |
| `routes/forum.js` | 111 | 5 | 3 |
| `routes/modules.js` | 109 | 5 | 3 |
| `routes/tools.js` | 68 | 3 | 1 |
| `routes/users.js` | 46 | 3 | 3 |

**Interpretation:**
- `routes/dashboard.js` is the largest route module (highest maintenance surface).
- `routes/tools.js` has the lowest dependency count (very low coupling, high isolation).

---

## 3) Cyclomatic Complexity (Lecture Formula Applied)

Lecture formula:

$$V(G) = 1 + d$$

Where $d$ is the number of decision points (e.g., `if`, branch predicates).

Because FinFriend is API-based, we applied this **per critical handler**.

### Estimated per-handler complexity (representative)

| Handler | Decision points ($d$) | Estimated $V(G)$ | Notes |
|---|---:|---:|---|
| `POST /api/modules/:slug/quiz` in `routes/modules.js` | 5 | 6 | Input existence, module existence, per-question check, pass condition, XP award |
| `GET /api/dashboard` in `routes/dashboard.js` | 2 | 3 | Guard/aggregation decisions inside one large orchestration handler |
| `GET /api/forum/threads` in `routes/forum.js` | 1 | 2 | Optional category filter branch |
| `POST /api/auth/login` in `routes/auth.js` | 3 | 4 | Missing fields, user existence, password validity |
| `POST /api/tools/loan` in `routes/tools.js` | 2 | 3 | Validation + `r > 0` repayment branch |

**Interpretation:**
- Most endpoints are in a manageable range.
- The quiz submission flow has the highest logical branching and should receive priority test coverage.

---

## 4) Depth of Nesting

Lecture principle: lower nesting depth generally reduces coding/testing complexity.

Observed pattern in FinFriend:
- Most handlers use **guard clauses** (`if (...) return ...`) and keep nesting shallow.
- Typical nesting depth is around **1–2 levels** in route handlers.
- Example shallow style is used consistently in:
  - `routes/auth.js`
  - `routes/modules.js`
  - `routes/forum.js`

**Interpretation:**
- FinFriend follows a low-nesting style, which aligns with lecture guidance for maintainability.

---

## 5) Information Flow Complexity (Fan-in / Fan-out)

Lecture concept (Henry–Kafura family): complexity grows with incoming/outgoing information flow.

Operationalized for FinFriend modules:
- **Fan-in:** number of components calling or routing into the module.
- **Fan-out:** number of major dependencies/services used by the module.

### Component-level fan-in / fan-out snapshot

| Component | Fan-in (approx.) | Fan-out (approx.) | Evidence |
|---|---:|---:|---|
| `routes/modules.js` | 1 (from `server.js`) + client traffic | 2 (`db/connection`, `authMiddleware`) | quiz/progress/XP flow |
| `routes/dashboard.js` | 1 + client traffic | 2 (`db/connection`, `authMiddleware`) | multi-query orchestration |
| `routes/tools.js` | 1 + client traffic | 0 DB/Auth dependencies | pure computation endpoints |
| `middleware/auth.js` | 5 route modules | 1 (`jsonwebtoken`) | shared gatekeeper across protected routes |
| `db/connection.js` (used indirectly) | 7 route modules | DB engine | central persistence dependency |

**Interpretation:**
- `db/connection` and `authMiddleware` are high fan-in infrastructural components.
- `routes/tools.js` stays intentionally low fan-out (good for isolation and testability).

---

## 6) Cohesion and Coupling (Lecture CBS View)

### Coupling evidence from imports

From route imports:
- High shared dependencies: `express`, `../db/connection`, `../middleware/auth`
- Security-heavy module: `routes/auth.js` also depends on `bcryptjs` and `jsonwebtoken`

### Qualitative cohesion assessment

| Module | Cohesion | Coupling | Why |
|---|---|---|---|
| `routes/tools.js` | High | Very Low | Only financial calculators; no DB/auth coupling |
| `routes/modules.js` | High | Moderate | Module listing + quiz + progress in one domain |
| `routes/dashboard.js` | Medium-High | Moderate | Dashboard, expenses, goals in one user-finance domain |
| `routes/forum.js` | High | Moderate | Categories, threads, replies in one domain |
| `routes/auth.js` | High | Higher (justified) | Registration/login/security concerns in one module |

**Interpretation:**
- FinFriend is mostly **high cohesion + low/moderate coupling**, consistent with modular route architecture.
- `routes/dashboard.js` is cohesive by domain, but broad in responsibility (aggregation + CRUD), making it the best candidate for controlled refactoring.

---

## 7) Architectural Morphology (Structure Summary)

Lecture architecture view models components and their relations as a graph.

For FinFriend backend:
- `server.js` composes **8 route components**.
- Most business routes connect to a shared DB component.
- Protected routes connect to a shared auth middleware component.

This forms a **hub-and-spoke architecture**:
- Hub 1: `server.js` (routing composition)
- Hub 2: `db/connection.js` (data access)
- Hub 3: `middleware/auth.js` (security gate)

**Interpretation:**
- The architecture supports maintainability through separation by feature route.
- Shared hubs should be kept stable and well-tested due to high fan-in impact.

---

## 8) Complexity Risks and Control Actions

### Identified risk hotspots

1. `routes/dashboard.js` (largest file, most endpoints)
2. `POST /api/modules/:slug/quiz` (highest decision density)
3. Shared infrastructure (`db/connection`, `authMiddleware`) due to fan-in

### Recommended actions (implementation-ready)

1. **Split `routes/dashboard.js`** into:
   - `routes/dashboard-overview.js`
   - `routes/expenses.js`
   - `routes/goals.js`
2. **Extract quiz scoring logic** from `routes/modules.js` into a service function for isolated unit testing.
3. **Add complexity gate in CI**:
   - fail PR when handler-level decision count exceeds agreed threshold (e.g., $V(G) > 10$).
4. **Keep calculator routes pure** (`routes/tools.js`) as low-coupling reference design.

---

## 9) Final Mapping to Lecture Concepts

| Lecture concept | FinFriend implementation |
|---|---|
| Control-flow structure | Branching and guards in route handlers (`routes/*.js`) |
| Cyclomatic complexity | Estimated per endpoint using $V(G)=1+d$ |
| Depth of nesting | Mostly shallow (guard-clause style) |
| Information flow complexity | Fan-in/fan-out around DB and auth hubs |
| Cohesion | Feature-oriented route modules |
| Coupling | Shared infra dependencies (`db/connection`, `authMiddleware`) |
| Architectural measurement | Component graph centered at `server.js` |

---

## 10) Conclusion

The lecture's internal product measurement model is clearly implementable on FinFriend.

- Structural complexity is generally controlled.
- Route modularization keeps cohesion high.
- Coupling is mostly moderate and intentional.
- Main improvement opportunity is decomposition of large orchestration modules (`dashboard`, quiz workflow) while preserving current low nesting and clear API boundaries.
