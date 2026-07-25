# Task B - Inherit and Improve: Lead CRM Assessment

## Table of Contents

1. [Codebase Assessment](#1-codebase-assessment)
2. [Phased Migration Plan](#2-phased-migration-plan)
3. [Before/After Refactor with Commentary](#3-beforeafter-refactor-with-commentary)
4. [Engineering Standards Proposal](#4-engineering-standards-proposal)

---

## 1. Codebase Assessment

### 1.1 What We Inherited

A full-stack Lead CRM application (React + Vite frontend, Express + MongoDB backend) that is functional and deployed. It handles authentication, role-based access control, lead lifecycle management, notes, activity logging, and a dashboard. The codebase runs, but carries significant technical debt that increases risk with every sprint.

### 1.2 Issues Found (Prioritized by Risk)

| # | Issue | Severity | Risk if Left Unfixed | Location |
|---|-------|----------|---------------------|----------|
| 1 | **Real MongoDB credentials and JWT secret exist in `.env` file** | CRITICAL | Credential leak if repo is ever made public or shared. Attacker gets full database access and can forge any JWT token. | `server/.env:3-5` |
| 2 | **Insecure fallback JWT secret hardcoded in config** | CRITICAL | If `JWT_SECRET` env var is missing, the app silently runs with `'replace-with-a-secure-secret'` - any attacker can forge admin tokens. | `server/config/index.js:7` |
| 3 | **No rate limiting on any endpoint** | HIGH | Brute-force attacks on `/auth/login`, credential stuffing, API abuse. A single attacker can exhaust database connections. | `server/server.js` (absent) |
| 4 | **No security headers (helmet)** | HIGH | Vulnerable to clickjacking, MIME sniffing, XSS via missing CSP/X-Content-Type-Options headers. | `server/server.js` (absent) |
| 5 | **No input sanitization (mongo-sanitize, xss-clean)** | HIGH | NoSQL injection via crafted JSON payloads (e.g., `{"email": {"$gt": ""}}`). | `server/server.js` (absent) |
| 6 | **Error handler leaks internal details, has no logging** | MEDIUM | Stack traces or internal paths could leak to clients. No audit trail for debugging production issues. | `server/middleware/errorHandler.js:1-8` |
| 7 | **Config variable name mismatch** | MEDIUM | `config/index.js` reads `MONGO_URI` but `.env` defines `MONGO_DB_URI`. App silently falls back to `localhost` instead of connecting to Atlas. | `server/config/index.js:6` vs `server/.env:3` |
| 8 | **`getStatusBadgeVariant` duplicated in 3 frontend files** | MEDIUM | Bug fix in one file doesn't propagate to others. Visual inconsistency risk. | `Dashboard.jsx:17-34`, `Leads.jsx:38-55`, `LeadDetail.jsx:11-28` |
| 9 | **Minimal test coverage** | MEDIUM | Only 3 test files cover auth, basic lead CRUD, and middleware. No tests for notes, dashboard, users, lead assignment, delete, or any frontend code. Regressions ship silently. | `server/tests/` (3 files) |
| 10 | **No token refresh mechanism** | MEDIUM | JWT expires in 1 hour with no refresh token. Users get silently logged out mid-session. No graceful handling of401 on frontend. | `auth.service.js:41`, `api.js` (no interceptor) |
| 11 | **No health check endpoint** | LOW | Render/downtime monitoring cannot verify the service is alive. | `server/server.js` (absent) |
| 12 | **`express-rate-limit` appears in client `package-lock.json`** | LOW | Server dependency accidentally in frontend lockfile. Unused bloat, confusing for audits. | `client/package-lock.json` |
| 13 | **No API versioning** | LOW | Breaking changes to endpoints will directly break all clients simultaneously. | `server/server.js` |
| 14 | **Dashboard service uses N+1 query for notes** | LOW | Fetches all user lead IDs, then queries notes separately. Performance degrades as lead count grows. | `server/services/dashboard.service.js:26-28` |
| 15 | **No graceful shutdown handling** | LOW | Server termination (deploy, OOM) can leave dangling DB connections and incomplete requests. | `server/server.js` |

### 1.3 Recommended Fix Order

Fix order follows the principle: **protect the breach surface first, then prevent silent failures, then improve reliability, then optimize.**

1. **Immediately (Day 1):** Rotate all credentials, fix config mismatch, add secure fallback behavior (issues 1, 2, 7)
2. **This week:** Add rate limiting, helmet, input sanitization (issues 3, 4, 5)
3. **Next week:** Improve error handling, add health check, fix frontend token handling (issues 6, 10, 11)
4. **Month 1:** Extract shared utilities, expand test coverage (issues 8, 9)
5. **Quarter 1:** Add API versioning, optimize queries, add graceful shutdown (issues 13, 14, 15)

---

## 2. Phased Migration Plan

### Guiding Principle

Every change ships behind a working system. No big-bang rewrites. Each phase produces a deployable, testable increment. The app never goes down.

### Week 1 - Security Hardening

**Goal:** Eliminate critical vulnerabilities without changing any business logic.

| What Ships | How | Risk | Rollback |
|------------|-----|------|----------|
| Rotate MongoDB password and JWT secret | Generate new credentials in Atlas, update `.env`, redeploy | Near-zero - same app, new secrets | Revert env vars |
| Fix config variable mismatch (`MONGO_URI` vs `MONGO_DB_URI`) | Align `config/index.js` to read `MONGO_DB_URI` | Low - one line change | Revert single line |
| Remove hardcoded JWT fallback | Throw error on startup if `JWT_SECRET` missing | Low - fails fast instead of silently insecure | Revert to fallback |
| Add `helmet` middleware | `npm i helmet`, add `app.use(helmet())` before routes | Low - adds headers, no logic change | Remove one line |
| Add `express-rate-limit` | `npm i express-rate-limit`, apply to `/auth` routes (5 req/15min) and global (100 req/15min) | Low - only affects abusive traffic | Remove middleware |
| Add `mongo-sanitize` | `npm i express-mongo-sanitize`, add `app.use(sanitize())` | Low - strips `$` keys from request bodies | Remove middleware |

**Validation:** All existing tests pass. Manual test: login, create lead, add note. Check response headers for `X-Content-Type-Options`, `X-Frame-Options`.

### Month 1 - Reliability and Observability

**Goal:** Make failures visible and recoverable. Ensure the app handles edge cases gracefully.

| What Ships | How | Risk | Rollback |
|------------|-----|------|----------|
| Improved error handler with structured logging | Replace `console.error` with a logger (e.g., `pino`). Log request ID, user ID, error stack. Never expose stack to client. | Low - output format change only | Revert middleware |
| Health check endpoint | Add `GET /health` returning `{ status: "ok", db: "connected" }` | Zero - new endpoint, no existing behavior change | Remove route |
| Frontend 401 interceptor | Add axios response interceptor: on401, clear token, redirect to `/login` | Low - only triggers on expired/invalid tokens | Remove interceptor |
| JWT refresh token flow | Issue refresh token on login (7-day expiry). Add `POST /auth/refresh` endpoint. Frontend auto-refreshes before expiry. | Medium - new endpoint + frontend change | Feature flag, disable refresh |
| Extract `getStatusBadgeVariant` to shared util | Create `client/src/lib/status.js`, import in 3 pages | Zero - pure refactor, no behavior change | Revert imports |
| Database indexes for hot paths | Add compound index on `{ assignedTo: 1, createdAt: -1 }` for leads, `{ lead: 1, createdAt: -1 }` for notes | Low - improves perf, no logic change | Drop indexes |
| Graceful shutdown handler | Listen for `SIGTERM`/`SIGINT`, close DB connection, drain HTTP server | Zero - only runs on process exit | Remove handler |

**Validation:** Run full test suite. Deploy to staging. Verify health endpoint returns200. Test token expiry flow (wait 1 hour or use short-lived test token).

### Quarter 1 - Structural Quality and Coverage

**Goal:** Establish engineering standards, achieve confidence in changes, prepare for scaling.

| What Ships | How | Risk | Rollback |
|------------|-----|------|----------|
| API versioning (`/api/v1/`) | Mount all routes under `/api/v1/`. Keep `/api/` as alias for 30 days. | Low - additive, old routes still work | Remove alias |
| Test coverage to 80%+ backend | Add tests for notes, dashboard, users, lead assignment, delete, authorization edge cases. Target: every service method + every route. | Zero - tests only, no production change | N/A |
| Frontend component tests | Add Vitest + React Testing Library. Test key flows: login form, lead creation form, dashboard rendering. | Zero - tests only | N/A |
| OpenAPI/Swagger documentation | Generate from route definitions. Serve at `/api/docs`. | Zero - documentation only | Remove route |
| Database migration tooling | Add `migrate-mongo` or similar for schema versioning. Document process. | Low - tooling only | Remove tool |
| CI/CD pipeline hardening | Add lint, typecheck, test, and build steps to CI. Block merge on failure. | Zero - process only | Disable checks |

**Validation:** Run full test suite (target: >80% coverage). Review OpenAPI docs in browser. Verify CI blocks a deliberately broken PR.

---

## 3. Before/After Refactor with Commentary

### 3.1 The "Before" - Realistic Bad Code

This is a realistic example of what a rushed, inherited codebase often looks like. This pattern is common in route handlers where business logic, database access, validation, and error handling all live in one place:

```javascript
// BAD: business logic stuffed into route handler
// server/routes/lead.routes.js (hypothetical "before" state)

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

router.post('/leads', async (req, res) => {
  // No auth check - anyone can create leads
  // No input validation
  try {
    const { name, email, phone, company, status } = req.body;

    // Business logic in route: validation
    if (!name || !email || !phone || !company) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Direct database call in route
    const lead = await mongoose.connection.db.collection('leads').insertOne({
      name,
      email,
      phone,
      company,
      status: status || 'NEW',
      createdAt: new Date(),
    });

    // Direct database call: check for duplicate email
    const existing = await mongoose.connection.db.collection('leads')
      .findOne({ email: email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Business logic: activity log
    await mongoose.connection.db.collection('activity').insertOne({
      leadId: lead.insertedId,
      action: 'CREATED',
      timestamp: new Date(),
    });

    // No proper error structure
    res.json({ id: lead.insertedId, message: 'Created' });
  } catch (e) {
    // Leaks internal error to client
    res.status(500).json({ message: e.message, stack: e.stack });
  }
});

router.get('/leads/:id', async (req, res) => {
  try {
    // No auth - anyone can view any lead
    // No validation of :id param
    const lead = await mongoose.connection.db.collection('leads')
      .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (!lead) {
      return res.status(404).json({ message: 'Not found' });
    }

    // Direct DB call for related data
    const notes = await mongoose.connection.db.collection('notes')
      .find({ leadId: lead._id })
      .toArray();

    // Business logic: combine data in route
    res.json({ ...lead, notes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
```

**Problems identified:**

1. **No authentication or authorization** - any anonymous user can create/view leads
2. **No input validation** - missing fields cause cryptic MongoDB errors
3. **Duplicate email check happens AFTER insert** - data integrity violation
4. **Direct `mongoose.connection.db.collection()` calls** - bypasses Mongoose schema, no type safety, no middleware
5. **Business logic in route handlers** - validation, activity logging, data combination all in one place
6. **Error handling leaks internals** - `e.stack` sent to client
7. **No separation of concerns** - impossible to unit test any piece independently
8. **Inconsistent response format** - `{ id, message }` vs `{ ...lead, notes }`

### 3.2 The "After" - Refactored Code

```javascript
// GOOD: separated concerns, validated inputs, proper auth
// server/routes/lead.routes.js

const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const leadController = require('../controllers/lead.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(verifyToken);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('company').trim().notEmpty().withMessage('Company is required'),
    body('status')
      .optional()
      .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  leadController.createLead
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Valid lead ID required')],
  validateRequest,
  leadController.getLead
);

module.exports = router;
```

```javascript
// GOOD: controller delegates to service
// server/controllers/lead.controller.js

const LeadService = require('../services/lead.service');

const createLead = async (req, res, next) => {
  try {
    const lead = await LeadService.createLead(req.body, req.user);
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await LeadService.getLeadById(req.params.id, req.user);
    res.json({ lead });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLead, getLead };
```

```javascript
// GOOD: service contains all business logic
// server/services/lead.service.js

const { Lead } = require('../models/lead.model');
const RequestError = require('../utils/RequestError');

class LeadService {
  static async createLead(data, user) {
    if (!data.name || !data.email || !data.phone || !data.company) {
      throw new RequestError('Missing required lead fields', 400);
    }

    const activityLog = [
      {
        action: 'CREATED',
        user: user._id,
        note: 'Lead created',
      },
    ];

    const newLead = new Lead({
      ...data,
      createdBy: user._id,
      assignedTo: data.assignedTo || user._id,
      activityLog,
    });

    await newLead.save();
    return Lead.findById(newLead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  static async getLeadById(id, user) {
    const lead = await Lead.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!lead) {
      throw new RequestError('Lead not found', 404);
    }

    if (user.role !== 'ADMIN' && String(lead.assignedTo?._id) !== String(user._id)) {
      throw new RequestError('Forbidden', 403);
    }

    return lead;
  }
}

module.exports = LeadService;
```

### 3.3 What Improved

| Aspect | Before | After |
|--------|--------|-------|
| **Security** | No auth, no authorization, anyone can create/view/delete leads | JWT auth on every route, role-based access in service layer |
| **Input validation** | None - raw `req.body` used directly | express-validator schemas at route level, clear error messages |
| **Data integrity** | Duplicate check after insert (race condition) | Mongoose schema-level unique constraints + service-level checks |
| **Separation of concerns** | Route handler does everything (validation, DB, business logic, response formatting) | Route: defines HTTP contract. Controller: delegates to service. Service: owns business logic and data access. |
| **Testability** | Impossible to test business logic without HTTP server | `LeadService.createLead()` can be unit-tested with mock data, no server needed |
| **Error handling** | `e.stack` leaked to client | Structured errors via `RequestError`, global handler formats response |
| **Response consistency** | Inconsistent shapes (`{ id, message }` vs `{ ...lead, notes }`) | Consistent `{ lead }` wrapper across all lead endpoints |
| **Maintainability** | Changing validation requires editing route handler mixed with DB calls | Each layer changes independently - validators in routes, logic in services |

---

## 4. Engineering Standards Proposal

### 4.1 Standards to Introduce

#### A. Code Architecture

| Standard | Rationale |
|----------|-----------|
| **Route → Controller → Service pattern** | Routes define HTTP contract (methods, paths, validation). Controllers handle request/response. Services contain business logic. No exceptions. |
| **No direct DB calls in controllers or routes** | All database access goes through Mongoose models and service methods. Raw `collection()` calls are forbidden. |
| **Shared utilities in `lib/` or `utils/`** | Duplicated logic (e.g., `getStatusBadgeVariant`) lives in one place, imported everywhere. |

#### B. Security

| Standard | Rationale |
|----------|-----------|
| **Auth middleware on every protected route** | No endpoint that touches user data is accessible without a valid JWT. |
| **Input validation at route boundaries** | Every POST/PUT/PATCH route has express-validator schemas. No raw `req.body` reaches a service. |
| **Secrets in environment variables only** | No hardcoded secrets, no fallback defaults that are insecure. App fails to start if config is missing. |
| **Security headers via helmet** | Baseline protection against XSS, clickjacking, MIME sniffing. Non-negotiable. |
| **Rate limiting on auth endpoints** | Prevent brute-force. 5 attempts per 15 minutes on login/register. |

#### C. Testing

| Standard | Rationale |
|----------|-----------|
| **Every service method has a unit test** | Business logic is the highest-value thing to test. |
| **Every route has an integration test** | Verify the full request cycle: validation → auth → controller → service → response. |
| **Frontend critical paths have component tests** | Login form, lead creation form, dashboard rendering at minimum. |
| **PRs cannot merge without passing CI** | Lint + test + build must all pass. No "skip CI" commits. |

#### D. Code Quality

| Standard | Rationale |
|----------|-----------|
| **Consistent error format** | All errors return `{ message: string, status: number }`. Never leak stack traces. |
| **Structured logging** | Use `pino` or similar. Log request ID, user ID, action. No `console.log` in production code. |
| **API versioning** | All endpoints under `/api/v1/`. Breaking changes require a new version. |
| **No `any` types in shared code** | JSDoc or TypeScript for all service and controller function signatures. |

#### E. Process

| Standard | Rationale |
|----------|-----------|
| **PR review required** | No direct pushes to `main`. Every change reviewed by at least one person. |
| **Conventional commits** | `feat:`, `fix:`, `refactor:`, `test:` prefixes. Enables automated changelogs. |
| **Deploy behind feature flags for risky changes** | New auth flows, database migrations, and breaking API changes ship behind flags. |
| **Incident response runbook** | Documented steps for: credential leak, database outage, high error rate. |

### 4.2 How to Get a Resistant Team to Adopt Them

The biggest barrier to standards adoption is not technical - it's cultural. Here is the strategy:

#### Phase 1: Start with Pain Points (Week 1-2)

**Don't announce "new standards."** Instead, fix the thing that hurt the most recently.

- If someone got burned by a bug that tests would have caught: "Let me add a test for this specific case so it doesn't happen again."
- If someone leaked a secret: "Let me set up the `.env` workflow so this is impossible."
- If someone spent hours debugging an inconsistent error format: "Let me create a shared error utility so we all use the same shape."

**Key principle:** Standards solve real problems the team has already felt. Frame every standard as "so this specific bad thing doesn't happen again."

#### Phase 2: Make It Easy (Week 3-4)

- **Provide templates, not rules.** Instead of "you must use the Route-Controller-Service pattern," provide a working example of a new endpoint that follows the pattern. Copy-paste is faster than reading docs.
- **Set up linting and formatting.** Let the tools enforce style so humans don't have to argue about it in code review. Add ESLint rules, Prettier config, and a pre-commit hook.
- **Create a "new endpoint" checklist.** A one-page document: "Adding a new API endpoint? Here's the 6-step process." Pin it in Slack/Teams.

#### Phase 3: Make It the Default (Month 1-2)

- **Pair programming sessions.** When a junior developer adds a feature, pair with them and follow the standards together. They learn by doing, not by reading.
- **"Standards champion" rotation.** Each sprint, one person is responsible for reviewing adherence to standards and answering questions. Rotate so everyone builds ownership.
- **Celebrate when standards prevent a bug.** When a test catches a regression, or a linter rule prevents a mistake, mention it in standup: "The validation schema caught a missing field in production - that would have been a500 error last month."

#### Phase 4: Institutionalize (Month 3+)

- **CI enforcement.** PRs that skip tests or lint fail automatically. No discussion needed.
- **Documentation in code.** Add comments that explain *why* a pattern exists, not just *what* it is. "This validation runs here because the service assumes clean input - if you remove it, you'll get MongoDB errors."
- **Quarterly tech debt review.** Dedicate one day per quarter to reviewing what standards are working, what's not, and what new ones are needed. Team proposes changes, not management.

#### Addressing Common Resistance

| Objection | Response |
|-----------|----------|
| "This slows me down" | "It slows down the first PR. It saves 10x on the 50th PR when you don't have to debug the same category of bug." |
| "We've always done it this way" | "The app is growing. What worked for 2 developers doesn't work for 5. We're not fixing what's not broken - we're preventing breakage at scale." |
| "The tests are too much work" | "I'll write the first 5 tests with you. After that, you'll see which tests actually save time and which are busywork. We'll adjust." |
| "Just let me ship my feature" | "Ship it. Add the test in the same PR. It's 15 minutes now vs. 2 hours of debugging when it breaks in production at 2am." |

The core insight: **standards are not imposed - they are adopted when the team experiences the pain they prevent.** Your job is to reduce the friction of adoption until it's lower than the friction of not adopting.

---

*Built for Digital Heroes Training Task - [digitalheroesco.com](https://digitalheroesco.com)*
