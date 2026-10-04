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
- [ ] DB-02: Add typed browser/server clients, session-refresh proxy, real data repository, ignored local environment and setup documentation; verify lint, types, build and an anonymous Data API query.
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
- Forecast: approximately 350–400 authored lines, generated types/lockfile excluded; clarity and security take precedence over size.
- Delivery strategy: ask-on-risk; no remote publishing authorized. Record work-unit commits and actual counts here. Ask before a subsequent commit if delivery-size threshold is exceeded.
- RDD: status output reported off but returned an unsafe authority-path ownership error; state is unknown. Do not modify ownership or toggle review automatically. Assessment is pending.
- Engram mirror: PENDING because host session registration could not be confirmed; keep this local recovery document authoritative until memory is available.
- DB-01 verification: rollback-only SQL observed RED before tables existed and GREEN after migration `20261004005907`; four RLS tables, 14 policies, grants read back, zero test rows remain. Security advisor clean; five unused-index INFO notices on empty new tables. Migration CLI unavailable; local filename aligned with hosted MCP migration version. 307 authored SQL lines.
- DB-01 commit: pending.
- Next: commit DB-01, then implement DB-02.

## Evidence
- Existing `src/lib/db/schema.sql` is an unapplied draft, not the migration source of truth.
- Remote project is ACTIVE_HEALTHY; initial public tables and migration history are empty.
- User explicitly confirmed Supabase Auth; Google/email/magic-link selection remains open.
