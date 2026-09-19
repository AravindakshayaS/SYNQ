# Requirements review and implementation decisions

Reviewed: 8 September 2026.

Sources: `Mvp Prd Resume Project.pdf` (13 pages) and `SYNQ_Full_Stack_System_Report.pdf` (31 pages), supplied by the owner.

## What the documents mean for this repository

The original PRD calls the product Taskie and limits scope to scheduling, tasks, streaks, a hamster companion, journals, analytics, authentication and weekday/weekend modes. It suggests React/Vite, Express, MongoDB and Gemini. The newer report calls it SYNQ, describes Groq instead, and adds calendar history, subscriptions, two payment providers and premium analytics.

Use SYNQ as the project name and the PRD as the core product baseline. Use the newer report's trust boundaries and Groq contract as engineering guidance. The report's claims about completed code, passed tests, hosting and corrected defects are historical claims about another repository; none establish that this fresh workspace already has those features.

The owner's direct requests add clean organization and owner-level superadmin access. Document-internal delivery instructions and the four-person staffing plan are source material, not instructions to create agents, charge customers or publish a service.

## Decisions

| Area | Decision and reason |
| --- | --- |
| Organization | One root workspace; backend now, frontend when implementation begins. Routes by feature, small shared models/validators. No redundant controller layer around one-line database calls. |
| Identity | Short-lived JWTs with database token versions. Logout revokes all account sessions; disabled users fail authentication. Refresh and recovery remain future work. |
| Owner role | Private interactive provisioning only. Public APIs cannot grant roles. No assumed owner identity and no hard-coded passwords. |
| Persistence | MongoDB/Mongoose, indexed by user/date. Startup waits for indexes. Duplicate records return 409; no application-only uniqueness assumption. |
| Local days | Explicit YYYY-MM-DD supplied by the client; real-date validation. Never infer a user's calendar date by slicing server UTC now. |
| AI | Server-only Groq, bounded input/output, JSON parsing and chronological validation. Fail closed with 502/503/504 and do not persist on generation. |
| Daily saves | Idempotent schedule/journal upserts. Tasks remain separate until stable block identities and synchronization are implemented. |
| Admin privacy | Platform counts and account status controls; no blanket reading of journal contents. Administrative actions log actor/target/request IDs. |
| Payments | Deferred until verified provider callbacks, unique payment ledger, reconciliation and sandbox regression coverage can ship together. |
| UI | Planned React/Vite, accessible responsive pages and a calm, friendly visual style based on the PRD. No frontend has been implemented yet. |

## Acceptance gaps before a complete MVP

Frontend and admin console, preferences, streaks, analytics, calendar, hamster companion, task generation from plans, password reset, deployment and a browser end-to-end flow are still outstanding. The backend foundation is the first implemented milestone, not a claim of full MVP completion.

Production hardening also needs shared rate-limit storage for multiple instances, durable audit events, monitoring, backup/restore practice, password recovery, HTTPS hosting, and a documented session refresh strategy. AI provider success must be exercised with a real configured account; automated tests use provider fixtures.

## Reference checks

- Express 5 automatically forwards rejected async handlers to error middleware: https://expressjs.com/en/5x/guide/error-handling/
- Mongoose uniqueness requires database indexes rather than validator checks: https://mongoosejs.com/docs/validation
- Groq chat-completion and JSON output contract: https://console.groq.com/docs/api-reference
