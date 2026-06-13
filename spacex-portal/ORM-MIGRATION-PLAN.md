# ORM Migration Plan

This document outlines a practical path to move from direct Supabase queries to an ORM-based data layer.

## Goal
Replace the current direct `supabase.from(...)` pattern with an ORM (recommended: Drizzle) while preserving the existing Supabase authentication and database setup.

## Recommended Approach
Use an incremental migration instead of a full rewrite:
1. Keep Supabase Auth for login and session handling.
2. Add Drizzle only for server-side database access.
3. Replace the query helpers in `src/lib/queries.ts` and `src/lib/api/members.ts` one area at a time.

## Why this is the safest path
- The current app already depends on Supabase for auth and RLS.
- The schema and policies are already defined in SQL under `sql/`.
- Drizzle can be introduced gradually without breaking the UI.

## Migration Phases

### Phase 1: Baseline and inventory
Tasks:
- List every place using `supabase.from(...)`, `supabase.auth`, and raw SQL helpers.
- Identify which data paths are used by the UI, API routes, and tests.
- Confirm the current schema in `sql/01-create-members-table.sql` and RLS rules in `sql/03-create-rls-policies.sql`.

Outcome:
- A clear mapping of what must be replaced.

### Phase 2: Add Drizzle to the project
Tasks:
- Install:
  - `drizzle-orm`
  - `drizzle-kit`
  - `postgres`
- Add a `drizzle.config.ts` file.
- Create a `src/db/` folder for schema and connection logic.

Outcome:
- The project can generate and run migrations with Drizzle.

### Phase 3: Define the schema
Tasks:
- Create a Drizzle schema that matches the existing `members` table.
- Keep the current SQL schema as the source of truth during the transition.
- Add enums and timestamps exactly as they exist today.

Outcome:
- The database model is represented in TypeScript.

### Phase 4: Build a small ORM adapter layer
Tasks:
- Create a thin abstraction for member operations, for example:
  - `getMemberByEmail()`
  - `listMembers()`
  - `createMember()`
  - `updateMember()`
  - `deleteMember()`
- Keep the existing API contracts stable so the UI does not break.

Outcome:
- The app can use ORM-based queries without changing the callers.

### Phase 5: Replace the current query helpers
Tasks:
- Migrate the logic in `src/lib/queries.ts` to use Drizzle.
- Migrate the helper layer in `src/lib/api/members.ts` to use the same adapter.
- Leave Supabase auth helpers untouched for now.

Outcome:
- The app uses ORM-based DB access for most member operations.

### Phase 6: Validate behavior and remove old path
Tasks:
- Run tests and confirm CRUD behavior still works.
- Verify that RLS and admin rules are still enforced.
- Remove the old direct Supabase query code only after the ORM path is verified.

Outcome:
- The migration is complete and stable.

## Risks to watch
- RLS rules may behave differently if the DB access path changes.
- The current project uses Supabase Auth and SQL-based policies; these should remain aligned.
- A big-bang replacement can introduce hidden bugs in the API layer.

## Suggested rollout order
1. Add Drizzle and schema.
2. Wrap the existing member operations behind an adapter.
3. Switch the API helpers first.
4. Update the UI only after the data layer is stable.

## Recommendation
For this project, the best path is not to replace everything at once. Start with a small Drizzle adapter for the member data layer, keep Supabase for authentication, and migrate the database access gradually.
