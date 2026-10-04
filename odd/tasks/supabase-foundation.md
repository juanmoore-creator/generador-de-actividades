# Supabase database foundation

## Outcome
Create a secure, versioned database in the existing `genact` project and connect typed application data-access clients using Supabase Auth. The final sign-in method is deferred by the user.

## Scope and constraints
- Target: `genact`, project ref `fveahyatcdvaiyfiuwtf`, via the authorized Supabase MCP session only.
- Preserve the current demo/localStorage UI; synthetic demo identities must never become authenticated cloud identities.
- No login provider configuration, billing changes, extra projects, deployment, push, or PR.
- Public author data must exclude email, school and entitlements. RLS must isolate owned activities; users cannot edit another owner's rows or spoof ownership.
- Use publishable keys only, pinned dependencies, generated database types, explicit errors and migration history.
- Preserve pre-existing `.gitignore` changes and `.engram/` files.

## Tasks
- [x] DB-01: Add and apply the database migration; prove anonymous restrictions, user isolation, owner-spoof protection and constraint behavior with rollback-only SQL; inspect security/performance advisors.
  - Route: delegated; new schema/security logic and SQL verification exceed mechanical inline work.
- [x] DB-02: Add typed browser/server clients, session-refresh proxy, real data repository, ignored local environment and setup documentation; verify lint, types, build and an anonymous Data API query.
  - Route: delegated; multiple non-trivial integration files and package installation.

## Acceptance and verification
- Read back remote tables, migration history, grants and RLS policies.
- Run SQL proof inside a transaction ending in ROLLBACK; no persistent test accounts/data.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; report base failures separately.
- No meaningful configured unit-test runner currently exists; use deterministic SQL checks and compile/build proof. Test SQL is written before migration implementation where feasible.
- Parent spot check: one reported command and structural readback.
- Do not claim cloud-backed UI or a working login until real authentication is implemented.

## Progress and delivery
- Initial Git state: `main`, modified `.gitignore`, untracked `.engram/`.
- Initial forecast 350–400 was too low. Observed DB-01 commit is 348 authored lines and DB-02 adds approximately 509, generated types/lockfile excluded. Updated delivery forecast: approximately 850–900 authored lines; clarity and security take precedence over size.
- Delivery strategy: ask-on-risk resolved by explicit user approval of `feature-branch-chain`, integration branch `codex/supabase-foundation`. Keep two coherent future review slices: DB-01 schema/proofs (`f4755b1`), then DB-02 typed connection/repository/check/docs. No push or PR is authorized or created. DB-02 exceeds the advisory 400-line task heuristic because typed ownership-safe CRUD and verification belong to one functional unit; no code-golf or artificial splitting.
- RDD: sandboxed status was unreliable due to Windows identity/ownership mismatch. Elevated read-only status confirmed ON (global). No ownership or mode settings were changed.
- Engram mirror: initial writes failed host registration checks, then recovered; full document saved and read back as observation 1644. Resynchronize each task update.
- DB-01 verification: rollback-only SQL observed RED before tables existed and GREEN after migration `20261004005907`; four RLS tables, 14 policies, grants read back, zero test rows remain. Security advisor clean; five unused-index INFO notices on empty new tables. Migration CLI unavailable; local filename aligned with hosted MCP migration version. 307 authored SQL lines.
- DB-01 commit: `f4755b1`, `feat(db): add secure Supabase foundation with RLS proofs`; 348 authored insertions including initial task document. Human `.gitignore` and `.engram/` were excluded.
- DB-01 native review: unavailable/pending, not approved. Assessment returned high/unassessable because `.engram/config.json` is pre-existing untracked. Negotiated committed-only STATUS for `HEAD^` returned `collect` / `external.select_intended_untracked`, schema `gentle-ai.review-intended-untracked-selection/v1`. This session has no corresponding capture surface, and bounded installed help/docs lookup found no documented input schema. No JSON was guessed; START was not invoked and no review lineage frozen.
- User explicitly authorized continuing this feature without native review while retaining tests and independent verification. This is a change-scoped exception only; global RDD remains untouched. No START lineage or consent invocation exists to resume/decline.
- DB-02 implementation and checks observed: pinned Supabase JS 2.117.2 / SSR 0.12.7; generated hosted types; validated browser/server clients and cookie-refresh Proxy; typed ownership-scoped repository; ignored local publishable-key environment; repeatable read-only smoke and setup guide. Demo UI/apiBridge remain local as authorized.
- DB-02 self-check: baseline/final lint and types passed using absolute npm.cmd/npx.cmd. Initial sandbox build could not fetch existing Google Fonts. Production audit reported zero; full audit reported five pre-existing high-severity dev-only eslint-config-next dependency findings, not changed.
- Independent verification: DB-01 SQL + extra feed/profile/likes isolation proofs passed, no synthetic rows remain. DB-02 lint/typecheck passed; one elevated production build passed and Proxy was recognized. Hosted types match; in-memory repository whitelist/owner/zero-row/pagination assertions passed. Independent production-audit repeat was blocked by sandbox network (writer's audit result stands, not independently repeated). Real sign-in/token refresh untested because login method is deferred.
- Parent spot check: absolute npm.cmd run check:supabase exit 0, public feed HTTP 200 and anonymous private activities HTTP 401. Local environment ignore rule confirmed; no secret/service-role key used.
- DB-02 outcome is verified and delivery strategy is user-approved; local commit evidence is being recorded. No native approval claimed; user-scoped exception honored and global RDD unchanged.
- Next: choose the real sign-in method and separately wire the UI to cloud persistence. No push or PR authorized.

## Evidence
- Existing `src/lib/db/schema.sql` is an unapplied draft, not the migration source of truth.
- Remote project is ACTIVE_HEALTHY; initial public tables and migration history are empty.
- User explicitly confirmed Supabase Auth; Google/email/magic-link selection remains open.
