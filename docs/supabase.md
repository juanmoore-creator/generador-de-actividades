# Supabase data foundation

This foundation adds a versioned Supabase schema, request-scoped clients, and a typed repository. The current demo remains local-only; this change does not create sign-in UI or configure a sign-in provider.

## Quick path

1. Copy `.env.example` to `.env.local` and set the project URL and a modern publishable key.
2. Restart the Next.js dev server after changing environment values.
3. Run `npm run check:supabase` to verify public-feed access and unauthenticated private-data denial.
4. Choose and configure the Auth sign-in method before connecting any UI to cloud data.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | HTTPS Supabase project origin (localhost is allowed over HTTP for local development). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_` key, safe for browser use with RLS. |

Both values are validated when a client is created. Missing, malformed, or non-publishable configuration throws a clear error; there is no fake local credential fallback. `.env.local` is ignored by the existing `.env*` rule. Never put a secret or service-role key in a public environment variable.

`src/lib/supabase/client.ts` creates the browser singleton. `src/lib/supabase/server.ts` creates a fresh server client for each request and adapts Next.js cookies. `src/proxy.ts` calls `auth.getClaims()` so refreshed cookies are passed to the rendered request and response; it does not redirect logged-out visitors or decide authorization. Responses passing through the proxy are `private, no-store` to prevent a personalized response from being shared by a cache.

## Data model and access

- `profiles` stores only an Auth UUID, display name, avatar URL, and timestamps. Email stays in `auth.users`; school, role, and entitlement fields are not public profile columns.
- `activities` is the authenticated user's private vault. Its owner defaults to `auth.uid()`, and RLS plus repository filters scope every list or mutation to the verified current user.
- `community_feed` stores an independent published copy. Review the snapshot for personal information before publishing. The public feed contains no counters or featured entitlement.
- `community_likes` has one row per user/post. Only the current user can read or delete their own like; liker identities are not public.

RLS is the authorization boundary even when callers bypass the repository. The repository gets the current Auth user from Supabase Auth instead of accepting caller-supplied owner IDs, whitelists writable fields, caps pages, sorts deterministically, and treats zero-row updates/deletes as `not_found` rather than success. Public feed reads do not expose like counts or identities.

Use the typed functions in `src/lib/services/supabaseRepository.ts` with an injected `SupabaseClient<Database>`. For a server action or handler, create the client with `await createSupabaseServerClient()`; for a Client Component, call `createSupabaseBrowserClient()`. `ensureCurrentProfile` verifies the current Auth user and always includes that user's UUID in the upsert, avoiding a missing-primary-key upsert. It can create an empty presentation profile lazily after a real user signs in.

Call `ensureCurrentProfile` after real sign-in and before the first activity, community post, or like insert. These inserts require a profile through foreign keys; repository mutations do not silently initialize one.

## Verification

The rollback-only database proof is `supabase/tests/database/foundation_rls.sql`; it uses synthetic Auth rows inside a transaction and finishes with `ROLLBACK`. `npm run check:supabase` performs only read-only Data API requests using the publishable key: public community feed must return HTTP 200 and private activities must return HTTP 401 or 403 without an Auth session. The script never prints the key, writes rows, or creates users.

The local database types in `src/lib/supabase/database.types.ts` are generated from the authorized hosted project's schema. Regenerate them after schema changes and commit the generated output with the migration.

## Deliberately deferred

The sign-in method and provider configuration remain undecided. The existing demo, synthetic sample identities, localStorage state, and `apiBridge` are unchanged and must not be mapped to Supabase Auth users. Cloud-backed UI, aggregate popularity, and profile display in the current interface are not implemented by this foundation.
