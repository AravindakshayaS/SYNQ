# SYNQ

A daily productivity planner with a React frontend and a separate Express API.

The supplied report describes another repository that was not present in this workspace. This repository is a new implementation. The frontend is now complete as a standalone demo and is ready to connect to the backend when its database is configured.

## Simple structure

```text
SYNQ/
  frontend/
    src/
      components/   Shared navigation, cards, forms and mascot
      pages/        Landing, auth and every workspace screen
      lib/          API client, demo state, dates and metrics
      styles/       The plum and blush design system
    package.json    Frontend-only commands and dependencies
    README.md       Frontend setup and connection guide
  backend/
    src/
      routes/       HTTP endpoints grouped by feature
      services/     External AI integration
      app.js        Express middleware and route wiring
      config.js     Startup configuration validation
      middleware.js Authentication, permissions, errors
      models.js     Four small MongoDB models and indexes
      validation.js Shared input and schedule validation
      server.js     Database connection and server lifecycle
    scripts/        Private superadmin setup
    test/           Validation, provider and real MongoDB API tests
    .env.example
  docs/             Requirements review and API contract
  package.json      Root commands
```

The two applications have their own `package.json` files and can be run independently. The root package only provides optional convenience commands.

## Run the frontend first

The frontend works without MongoDB through its clearly labeled demo workspace.

1. Open a terminal in `frontend`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:5173` and choose **Take a look around**.

See [the frontend guide](frontend/README.md) for the screen list and later API connection steps.

## Run the backend later

The backend requires Node.js 22.13+ and MongoDB. Copy `backend/.env.example` to `backend/.env`, configure `MONGODB_URI` and `JWT_SECRET`, then run `npm install` and `npm run dev` inside `backend`. The API listens on `http://127.0.0.1:4000`.

## Your superadmin account

Superadmin is a real database role checked on every authenticated request. Public registration rejects role fields and always creates regular users. The private setup command creates the owner; it refuses to silently promote or overwrite an existing account. No default password or first-signup administrative access exists.

After setup, use `POST /api/auth/login` with your email and password. Superadmins can list accounts, see platform counts, and disable/re-enable regular users. Disabling an account immediately invalidates its sessions. Administrative changes emit metadata-only structured audit events to server stdout. Durable audit storage and a browser admin console are future work.

Superadmin does not bypass journal/task ownership or expose password hashes. You own platform administration; private productivity records remain scoped to their respective users. Additional administrative capabilities should be added explicitly with audit coverage.

## Implemented frontend

- Responsive landing, login and registration pages.
- Dashboard, tasks, planner, journal, calendar, analytics and settings.
- A clearly labeled browser-local demo workspace for frontend review.
- Superadmin console preview and live backend integration for provisioned superadmins.
- The supplied `#190019`, `#2B124C`, `#522B5B`, `#854F6C`, `#DFB6B2` and `#FBE4D8` palette throughout.
- Keyboard focus states, semantic controls, reduced-motion support and mobile navigation.

## Implemented backend

- Registration/login, bcrypt hashing, 30-minute JWT access tokens, logout revocation.
- Task CRUD with pending/completed/skipped states.
- One journal and schedule per user/date; repeatable daily upserts.
- Validated server-only Groq schedule proposals, timeout handling and per-user request limits. Requires a Groq key and a model supporting JSON object output. Proposals are saved only by a separate explicit request.
- Paginated lists, strict allowlists, user isolation, security headers, request IDs and health readiness.
- Superadmin APIs and private account provisioning.

## Verification and next milestones

Verified on 9 September 2026: the frontend production build passes, all 3 frontend logic tests and all 10 backend tests pass, JavaScript syntax checks pass, and the installation audit reports zero known vulnerabilities. API tests use a real temporary MongoDB instance; Groq responses are mocked. No production database, owner account, live AI credentials or deployment has been configured.

1. Configure MongoDB and create the private owner account.
2. Add persistent preferences and schedule-to-task synchronization with stable block IDs.
3. Add payment ledger, provider sandbox flows, signed webhooks and reconciliation before enabling billing.
4. Add password recovery, session refresh, production monitoring and deployment.

The API binds to loopback for local development. Hosting requires an explicit bind-address change, database/network configuration, exact proxy topology, production origins and release verification. It has not been deployed.

See [requirements review](docs/requirements-review.md) and [API contract](docs/api.md).
