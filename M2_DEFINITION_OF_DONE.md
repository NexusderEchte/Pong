# M2 Definition of Done

**Project:** TEST_HARNESS_PING_PONG (Pong)
**Milestone:** M2 — The Verification Loop
**Assignment:** AI in Software Development WS 2026/27, Prof. Dr. Andreas Hinderks
**Assignment deadline (from `AUFGABE.pdf`):** upload to Moodle by **2026-11-15 23:59**, live demonstration in the exercise of the week of **2026-11-16**
**Document status:** Draft updated with project-owner decisions on 2026-11-14. Documentation only; no application code, schema, migration, test or tool changes were made.
**Created:** 2026-11-14
**Decisions applied:** single repository; Supabase will be used; `result.txt` removed; no anti-cheat requirement; no local Supabase; `requirementsm2.md` dropped.

---

## 0. Purpose, sources and how to read this document

This file turns the M2 requirements into a verifiable Definition of Done (DoD) for two workstreams:

1. **Harness:** two domain-specific tools, a working verification feedback loop, an enforced stop criterion, and a documented/configured sandbox and permission concept.
2. **Target application:** Supabase-backed authentication, profiles, persistence, match history, leaderboard, statistics, and RLS/data security in the existing Pong app.

### Sources inspected

| Source                                                                                                                | What was used                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `AUFGABE.pdf` (pp. 3–7, §1.2, §2.3)                                                                                   | M2 deliverables, repository model, deadline, honesty/documentation rules |
| `PROJECT_SPEC.md`                                                                                                     | Functional requirements §2.1–2.3, technology §3, quality §4, scope §5    |
| `AGENTS.md`                                                                                                           | Stack, development/Git rules, secret-handling rule                       |
| `package.json`, `vite.config.ts`, `tsconfig.app.json`, `playwright.config.ts`, `eslint.config.js`, `.prettierrc.json` | Actual toolchain and scripts                                             |
| `src/**`, `e2e/**`                                                                                                    | Actual application and test implementation                               |
| `opencode.json`, `.opencode/tools/*`, `.opencode/package.json`                                                        | Actual harness configuration and tools                                   |
| `README.md`, `HARNESS_README.md`, `MODEL_SELECTION.md`                                                                | Existing documentation; claims cross-checked against code                |
| Git status/history                                                                                                    | Current workspace state; staged changes were inspected but not modified  |

### Requirement classes used in every table

| Tag        | Meaning                                                                                          | Binding?                     |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| `M2`       | Explicitly required by `AUFGABE.pdf` §2.3                                                        | Yes — failure blocks M2      |
| `SPEC`     | Explicitly required by `PROJECT_SPEC.md`                                                         | Yes — project requirement    |
| `APP`      | Required to deliver the planned M2 application scope (implementation-level expression of `SPEC`) | Yes for this milestone scope |
| `ACCEPTED` | Project-owner decision that closes or accepts a conflict/limitation; no further work required    | Recorded, not re-opened      |
| `PROPOSED` | Our design decision; not mandated by assignment or specification                                 | Needs approval               |
| `OPT`      | Optional improvement; explicitly **not** required for M2 sign-off                                | No                           |

### Important honesty note

The stale status report `result.txt` has been deleted by project-owner decision. It claimed "no game logic/physics, points awarded manually" and a match to 11, while the code has a real physics engine (`src/game/pong.ts`) and a first-to-**5** match (`WINNING_SCORE = 5`).

`README.md` has been updated to describe the Supabase target instead of claiming that Supabase is intentionally excluded. The current code is still mock-based until the M2 implementation lands; the README now distinguishes current prototype state from the M2 target.

`requirementsm2.md` was removed by the project owner and is no longer a source or dependency.

---

## 1. M2 objectives

### 1.1 Assignment objectives (`M2`)

M2 must make the agent verify its own work in the project domain. Concretely:

- **OBJ-1** — At least **two domain-specific tools implemented by the team**. The M1 tool may count only if it is domain-specific. Built-in agent tools do not count.
- **OBJ-2** — A **verification signal** (tests, type checker, build, or simulation) that the agent reacts to. A log must show: failing signal → agent changes its work → check is run again.
- **OBJ-3** — An **explicit stop criterion** (step limit, retry limit, time budget) and evidence that it takes effect.
- **OBJ-4** — A **documented and configured sandbox and permission concept**: what may run without asking, what requires confirmation, what is forbidden, and how the agent is isolated.
- **OBJ-5** — A demonstration in which the agent implements one feature until the verification signal passes, including the run log.

### 1.2 Application objectives (`SPEC` + `APP`)

- **OBJ-6** — Replace mock authentication with **Supabase Auth** (register, login, logout, persistent session).
- **OBJ-7** — Store each user's **player profile** (username) in **Supabase PostgreSQL**.
- **OBJ-8** — Persist **match results/high scores** durably.
- **OBJ-9** — Serve a **global leaderboard from the shared database**, not hardcoded data.
- **OBJ-10** — Derive **player statistics** (matches, wins, losses, win rate, points) from stored matches.
- **OBJ-11** — Enforce **RLS and safe database access**; no secrets in source or client bundle.
- **OBJ-12** — Keep the game playable in the browser and capture its results.

### 1.3 Definition of Done

M2 is done only when **all** of the following hold:

1. Every `M2` and `SPEC` criterion in this document is `PASS` with recorded evidence.
2. Every `APP` criterion is `PASS`, or a deviation is explicitly documented and approved.
3. Every `PROPOSED` decision that is required for the above has been approved.
4. The M2 demonstration checklist in §11 has been executed successfully at least once.
5. The verification log demonstrates a real fail → change → re-run → pass cycle and a real stop-criterion trigger.

---

## 2. Application acceptance criteria

All criteria use the existing React/TypeScript/Vite app. The game engine in `src/game/pong.ts` is kept; UI and data access change.

### 2.1 Authentication and session

| ID         | What must be achieved                                                                                                                  | How it is verified                                                                                                                                                                                                | Success                                                                                                                       | Class    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| APP-AUTH-1 | Registration creates a Supabase Auth user and a linked profile row.                                                                    | Component/integration test with mocked Supabase client for UI; integration test against the dedicated hosted development/test project; E2E registration. Assert `auth.users` entry + `profiles` row with same id. | Account can sign in immediately after the configured confirmation flow; exactly one profile row exists.                       | APP      |
| APP-AUTH-2 | Login with valid credentials establishes a Supabase session; invalid credentials show a non-leaking error.                             | Component test mocking success/failure; integration test against the dedicated hosted development/test project; E2E demo user.                                                                                    | Valid login reaches dashboard; invalid login stays on login page with generic error; no token/password in message or console. | APP      |
| APP-AUTH-3 | Logout clears the Supabase session and returns to login; protected routes redirect unauthenticated users.                              | Component test; E2E logout then direct navigation to `#/dashboard`, `#/game`, `#/profile`, `#/leaderboard`.                                                                                                       | No authenticated page renders without a session; reload after logout stays logged out.                                        | APP      |
| APP-AUTH-4 | Session survives page reload and token refresh.                                                                                        | E2E: login, reload, assert dashboard; integration test refreshing session; integration test with expired access token if feasible.                                                                                | User remains signed in after reload; refreshed token is used; no manual re-login.                                             | APP      |
| APP-AUTH-5 | The mock auth path (`AuthProvider` in-memory accounts + `localStorage` user object) is no longer the production authentication source. | Code inspection; unit test asserting `localStorage` does not store a user/profile object; grep for `DEMO_PASSWORD`/`pingpong.session`.                                                                            | All session state comes from Supabase; no credential-like constants remain in client code.                                    | APP      |
| APP-AUTH-6 | Auth state is exposed through the existing `useAuth` contract (or an approved equivalent) so pages do not fetch auth ad hoc.           | Code review of `src/context/*`; component tests render pages through `App`.                                                                                                                                       | One provider owns session state; no duplicate Supabase auth listeners.                                                        | PROPOSED |
| APP-AUTH-7 | Provide a repeatable way to create/seed a demo account for demonstration.                                                              | Documented seed step in test setup/demo script; E2E uses the seeded account.                                                                                                                                      | Demo login works against the dedicated development/test project.                                                              | PROPOSED |

### 2.2 Player profile

| ID         | What must be achieved                                                                             | How it is verified                                                                 | Success                                                                                           | Class |
| ---------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- |
| APP-PROF-1 | Each authenticated user has a profile containing at least a unique username and the auth user id. | DB query after signup; integration test; component test rendering profile.         | One profile per user; duplicate username is rejected by the database, not only the UI.            | SPEC  |
| APP-PROF-2 | The profile page reads the signed-in user's profile from the database.                            | E2E login → profile; modify DB row and re-render; component test with mocked data. | Displayed values come from the DB query result; no `demoUser`/`mockData` fallback for real users. | APP   |
| APP-PROF-3 | Profile data persists across logout/login and reload.                                             | E2E: register → logout → login → reload → profile.                                 | Same username/profile persists; survives a new browser context using the same credentials.        | SPEC  |
| APP-PROF-4 | Database failures and missing profiles produce explicit UI states (loading, error, empty).        | Component tests for each state.                                                    | No silent blank screen or mock fallback; error is actionable and non-leaking.                     | APP   |
| APP-PROF-5 | Optional profile editing (bio, location, display name).                                           | Component + integration test if implemented.                                       | Only own profile can be updated; RLS rejects foreign updates.                                     | OPT   |

### 2.3 Match result persistence

| ID          | What must be achieved                                                                                                        | How it is verified                                                                                            | Success                                                                                                                    | Class    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| APP-MATCH-1 | A finished match stores: user id, human score, AI score, winner, played-at timestamp, and a mode value.                      | Integration test: play/emit a finished `GameState` through the save path, then query DB. E2E full match to 5. | Exactly one match row per finished match; scores/winner match the final `GameState`; no row for aborted/restarted matches. | SPEC     |
| APP-MATCH-2 | Only an authenticated user can insert a match, and only for their own user id.                                               | RLS test: anon insert fails; user A inserting `user_id = B` fails.                                            | No unauthorized insert succeeds.                                                                                           | APP      |
| APP-MATCH-3 | No anti-cheat mechanism is required. RLS prevents writing for another user; client-submitted scores are accepted as trusted. | RLS negative test (own user only); security note.                                                             | RLS enforced; no anti-cheat claimed or required.                                                                           | ACCEPTED |
| APP-MATCH-4 | Duplicate-save prevention is optional; a single-save guard is acceptable if simple.                                          | Unit test if a guard is implemented.                                                                          | If omitted, the limitation is documented; no retry storm.                                                                  | OPT      |
| APP-MATCH-5 | The winning score used by the engine is the value persisted/displayed.                                                       | Unit test asserting `WINNING_SCORE`; E2E to 5.                                                                | No hardcoded 11 in UI/persistence while the engine plays to 5.                                                             | APP      |

### 2.4 Match history

| ID         | What must be achieved                                                             | How it is verified                                                                | Success                                                   | Class |
| ---------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | ----- |
| APP-HIST-1 | The profile/history view lists the signed-in user's stored matches, newest first. | Integration test with seeded rows for two users; E2E after a match.               | Only own matches appear; order is correct; fields render. | SPEC  |
| APP-HIST-2 | History persists across reload, logout/login and browser restart.                 | E2E with reload + new context.                                                    | Rows remain; no mock history appears.                     | SPEC  |
| APP-HIST-3 | A new user sees a real empty state, not demo history.                             | Component test + E2E new account.                                                 | Empty-state UI shown; zero rows in DB.                    | APP   |
| APP-HIST-4 | Existing mock match history is not used for real users.                           | Code inspection for `getMatchHistory`/`matchHistory` imports in production paths. | No mock-data fallback in the persistence path.            | APP   |

### 2.5 Leaderboard and statistics

| ID         | What must be achieved                                                       | How it is verified                                                            | Success                                                                                 | Class    |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| APP-LB-1   | The leaderboard is global and database-backed across all users.             | Seed 3+ users/matches; query UI/API; integration test; two browser contexts.  | All eligible users ranked from DB; no hardcoded list.                                   | SPEC     |
| APP-LB-2   | Ranking order is deterministic and documented (points, then tie-breaker).   | Unit test on the aggregation/sort function; integration test with ties.       | Stable order; ties resolved by approved rule.                                           | PROPOSED |
| APP-LB-3   | The signed-in user is highlighted by auth id, not username string matching. | Component test with duplicate usernames if allowed (otherwise id-based test). | Correct row highlighted for the current user.                                           | APP      |
| APP-LB-4   | A newly recorded match changes the leaderboard/statistics after refresh.    | E2E: record match, reload leaderboard.                                        | Wins/losses/points update consistently with the stored match.                           | SPEC     |
| APP-STAT-1 | Dashboard and profile statistics are derived from stored matches.           | Integration test comparing aggregates against fixture rows.                   | matches/wins/losses/winRate/points equal expected aggregates.                           | SPEC     |
| APP-STAT-2 | Statistics are consistent across dashboard, profile and leaderboard.        | Cross-view E2E/integration assertion.                                         | Same user shows the same wins/losses/points in all views.                               | APP      |
| APP-STAT-3 | Zero-state users show zero/neutral values without errors.                   | Component test + E2E new account.                                             | No division-by-zero, `NaN`, `Infinity`, or fake rank.                                   | APP      |
| APP-STAT-4 | `rank` in the UI comes from the global ordering, not mock data.             | Integration test; inspect `User.stats` usage.                                 | Rank equals the user's position in the DB leaderboard.                                  | APP      |
| APP-STAT-5 | Optional streaks/average points/tournaments remain optional.                | N/A unless implemented.                                                       | If kept in UI, they must be derived or clearly labelled as unavailable; no fake values. | OPT      |

### 2.6 Game and UI integration

| ID         | What must be achieved                                                                               | How it is verified                                                        | Success                                                                   | Class |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----- |
| APP-GAME-1 | The game remains playable in the browser with the existing keyboard controls, pause/resume/restart. | Existing `src/game/pong.test.ts`; existing/adapted `GamePage` tests; E2E. | All game tests pass; controls unchanged or improved with tests.           | SPEC  |
| APP-GAME-2 | Finishing a match triggers persistence exactly once and shows the result.                           | E2E; component test with a mocked save function.                          | Winner overlay appears; save called once; success/failure feedback shown. | APP   |
| APP-UI-1   | Loading/error states exist for all DB-backed views.                                                 | Component tests per page.                                                 | No unhandled promise rejection, no blank screens, no secret leakage.      | APP   |
| APP-UI-2   | Existing routes and navigation remain functional.                                                   | `src/App.test.tsx` (adapted) + E2E navigation.                            | All routes reachable per auth state.                                      | APP   |
| APP-UI-3   | No unrelated visual regression.                                                                     | Existing snapshots/screenshots if any; manual/e2e smoke.                  | Existing design and responsive behaviour preserved.                       | APP   |

---

## 3. Supabase acceptance criteria

These criteria define the data/backend layer required by `PROJECT_SPEC.md` §3. SQL/schema details below are **proposed** unless marked `SPEC`.

### 3.1 Schema and migrations

| ID   | What must be achieved                                                                                                                                                                               | How it is verified                                                                                         | Success                                                                     | Class    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| DB-1 | A `profiles` table exists with `id uuid` referencing `auth.users(id)`, `username text` unique, `created_at timestamptz`.                                                                            | Migration review; `information_schema` query in verification tool.                                         | Table, FK, unique constraint and default exist; orphan profiles impossible. | SPEC     |
| DB-2 | A `matches` table exists with `id uuid`, `user_id uuid` referencing `profiles(id)`/`auth.users(id)`, `player_score int`, `opponent_score int`, `winner text`, `mode text`, `played_at timestamptz`. | Schema assertions in verification tool; integration insert/select.                                         | Columns/types/constraints as approved; insert/read works.                   | SPEC     |
| DB-3 | Constraints reject invalid data: non-negative scores, bounded scores, `winner IN ('human','ai')`, username length/format.                                                                           | Negative integration tests (`expect insert to fail`) for each constraint.                                  | Every invalid case is rejected by PostgreSQL.                               | APP      |
| DB-4 | Indexes support history (user + played_at desc) and leaderboard aggregation.                                                                                                                        | `EXPLAIN`/index catalog check; basic performance sanity.                                                   | Indexes exist and are used where expected.                                  | APP      |
| DB-5 | All schema changes are versioned migrations committed to the repository.                                                                                                                            | Migration directory listing; apply from the current baseline to the dedicated development/test project.    | Migrations apply successfully; no manual-only steps.                        | APP      |
| DB-6 | Migrations are repeatable and the resulting schema is reproducible on the dedicated development/test project.                                                                                       | `verify-supabase-backend` mode `schema` applies/validates migrations against the development/test project. | Exit code 0; schema matches expectations; no production target accepted.    | APP      |
| DB-7 | Profile creation is deterministic: either a DB trigger on `auth.users` or a single application step after signup.                                                                                   | Integration signup test; inspect auth users vs profiles.                                                   | Every auth user gets exactly one profile; no race duplicates.               | PROPOSED |
| DB-8 | Timestamps use UTC and are set server-side by default.                                                                                                                                              | Schema check + insert without timestamp then read.                                                         | Non-null, server-generated `created_at`/`played_at`.                        | PROPOSED |

### 3.2 Supabase Auth configuration

| ID        | What must be achieved                                                     | How it is verified                                                                     | Success                                               | Class    |
| --------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| DB-AUTH-1 | Email/password auth is enabled for the environment used in demos.         | Supabase config inspection; signup/login integration.                                  | Registration and login succeed as configured.         | SPEC     |
| DB-AUTH-2 | Email confirmation policy is decided and documented.                      | Config inspection; test expectation matches policy.                                    | No test/demo depends on an undocumented mailbox step. | PROPOSED |
| DB-AUTH-3 | Session refresh/persistence is enabled and the client is configured once. | Integration session refresh; code review for a single client module.                   | One client instance; session persists; refresh works. | APP      |
| DB-AUTH-4 | Auth errors are mapped to safe user messages.                             | Component tests with representative errors (invalid credentials, rate limit, network). | No raw server error/token leakage.                    | APP      |

### 3.3 Client integration and data access

| ID          | What must be achieved                                                                              | How it is verified                                       | Success                                                                           | Class    |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| DB-CLIENT-1 | A single Supabase client module reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.     | Code review; unit test with env stubs; build inspection. | No URL/key literals in source; client is importable and typed.                    | APP      |
| DB-CLIENT-2 | Database access is isolated behind typed data-access functions/hooks, not scattered in components. | Code review; component tests mock the data layer.        | Pages do not import the Supabase client directly for queries (auth provider may). | PROPOSED |
| DB-CLIENT-3 | Generated database types (or equivalent hand-maintained types) describe tables.                    | `tsc` typecheck; review.                                 | No `any` at DB boundaries; invalid columns fail typecheck.                        | PROPOSED |
| DB-CLIENT-4 | Leaderboard is computed consistently (SQL view/RPC or a single documented query).                  | Integration test comparing DB result to UI.              | One source of truth for ranking; no duplicated scoring logic in UI.               | PROPOSED |
| DB-CLIENT-5 | Match writes and reads use parameterized client calls; no string-built SQL.                        | Code review + grep; integration tests.                   | No SQL string concatenation with user input.                                      | SPEC     |
| DB-CLIENT-6 | The app fails fast with a clear message if Supabase env vars are missing.                          | Unit test for config module; manual run without env.     | Deterministic error, no silent mock fallback.                                     | APP      |

### 3.4 Persistence

| ID           | What must be achieved                                             | How it is verified                                              | Success                                         | Class |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- | ----- |
| DB-PERSIST-1 | Data survives app restart (not only `localStorage`).              | Integration: write, restart process/page, read.                 | Data is returned from PostgreSQL.               | SPEC  |
| DB-PERSIST-2 | Data is shared between independent clients.                       | Two browser contexts / two test clients.                        | Both observe the same leaderboard/profile data. | SPEC  |
| DB-PERSIST-3 | No mock data is written to or read from the production data path. | Code inspection; DB fixture audit; grep for `mockData` imports. | Real accounts have only DB-derived data.        | APP   |

---

## 4. Security and RLS criteria

### 4.1 Secrets and client safety

| ID    | What must be achieved                                                                                                                    | How it is verified                                                                        | Success                                                                               | Class |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----- |
| SEC-1 | Only the **publishable** key is shipped to the browser; the service-role key is never in client code, `VITE_*` variables, or the bundle. | Grep source + `dist/` for key patterns; env inspection; bundle scan in verification tool. | No service-role key in repo or bundle; publishable key is the only client credential. | SPEC  |
| SEC-2 | `.env*` files are gitignored and absent from Git history; a committed example file contains placeholders only.                           | `git log --all -- .env*`; `git status --ignored`; review of `.env.example` if added.      | No real secret in history; placeholders only.                                         | SPEC  |
| SEC-3 | Secrets are never logged, echoed, or embedded in error messages/test artifacts.                                                          | Log/artifact scan; code review; tool redaction test.                                      | No secret values in console, test output or generated result files.                   | SPEC  |
| SEC-4 | The service-role key, if required by DB tests, exists only in the harness process environment and is never `VITE_`-prefixed.             | Config review; env naming check; client import graph.                                     | Client bundle cannot access it.                                                       | APP   |
| SEC-5 | Error UI does not reveal internals (SQL, tokens, stack traces).                                                                          | Component tests with forced errors; bundle review.                                        | Generic user-facing messages; details only in dev logs without secrets.               | APP   |

### 4.2 RLS policies

RLS must be **enabled** on every application table. The policy set below is proposed and must be reviewed before implementation.

| ID         | What must be achieved                                                                                                      | How it is verified                                             | Success                                                                                | Class             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------- |
| SEC-RLS-1  | RLS is enabled on `profiles` and `matches`.                                                                                | Catalog query `pg_tables.rowsecurity`.                         | `true` for every app table.                                                            | SPEC              |
| SEC-RLS-2  | Anonymous clients cannot read or write application data, except explicitly public data required by the leaderboard.        | RLS tests with anon role: `select`/`insert`/`update`/`delete`. | All non-public operations fail; public leaderboard access limited to approved columns. | SPEC              |
| SEC-RLS-3  | An authenticated user can insert only their own profile (`id = auth.uid()`).                                               | User A attempts to insert profile for user B.                  | Insert rejected.                                                                       | APP               |
| SEC-RLS-4  | An authenticated user can update only their own profile.                                                                   | User A updates user B's profile.                               | Zero rows affected or error; B unchanged.                                              | APP               |
| SEC-RLS-5  | A user can insert matches only with `user_id = auth.uid()`.                                                                | User A inserts match for B; anon inserts match.                | Both rejected; own insert succeeds.                                                    | APP               |
| SEC-RLS-6  | A user can read only their own match rows (history is private).                                                            | User A selects; assert only A's rows; user B sees none of A's. | No cross-user raw match leakage.                                                       | APP               |
| SEC-RLS-7  | The global leaderboard exposes only approved aggregate/public fields to authenticated users.                               | Leaderboard query test as A and B; inspect exposed columns.    | Both see all players' username/wins/losses/points; no private raw rows.                | PROPOSED          |
| SEC-RLS-8  | Users cannot update or delete other users' matches.                                                                        | Negative update/delete tests.                                  | No cross-user mutation succeeds.                                                       | APP               |
| SEC-RLS-9  | Policies are tested both positively and negatively for every role (anon, user A, user B, service role only in test setup). | Runnable RLS test suite in `verify-supabase-backend`.          | All policy cases pass; failures include policy name/remediation.                       | M2 (verification) |
| SEC-RLS-10 | `DELETE` of own matches is either allowed with policy or explicitly forbidden and documented.                              | Decision recorded; test matches decision.                      | Behaviour is deterministic and documented.                                             | PROPOSED          |
| SEC-RLS-11 | Leaderboard privacy trade-off (public username + aggregate vs. exposing matches) is documented.                            | Review of policy and migration comments; docs.                 | No undocumented cross-user data exposure.                                              | PROPOSED          |

### 4.3 Residual risks to state honestly

| ID         | What must be achieved                                                                                            | How it is verified                                           | Success                                                                | Class    |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | -------- |
| SEC-RISK-1 | Client-side score submission is acknowledged as trusted; anti-cheat is explicitly not required for this project. | Security note in M2 documentation.                           | Decision recorded; no anti-cheat claimed.                              | ACCEPTED |
| SEC-RISK-2 | No production Supabase project is used for tests.                                                                | Verification tool target guard + explicit project-ref check. | Tool refuses targets other than the approved development/test project. | PROPOSED |
| SEC-RISK-3 | Rate limiting / abuse protection is out of scope unless provided by Supabase defaults.                           | Documented.                                                  | Not claimed as implemented.                                            | OPT      |

---

## 5. Harness acceptance criteria

### 5.1 Baseline (verified today)

| Item                       | Actual state                                                                                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `check-project`            | Exists in `.opencode/tools/check-project.ts`; **generic** project inspection (name, scripts, directories).                                                                                                                                                                     |
| `run-pong-checks`          | Exists in `.opencode/tools/run-pong-checks.ts`; **generic** sequential npm script runner (`typecheck`, `lint`, `test`, `build`) with 120 s timeout and 8 kB output cap.                                                                                                        |
| Domain specificity         | Neither tool encodes Pong rules, game simulation, Supabase schema, migrations, or RLS. Under `AUFGABE.pdf` §2.3, the M1 tool "counts if it is domain-specific"; therefore **the existing two tools cannot be assumed to satisfy the "two domain-specific tools" requirement**. |
| Verification loop evidence | No recorded log of fail → change → pass.                                                                                                                                                                                                                                       |
| Stop criterion             | None implemented.                                                                                                                                                                                                                                                              |
| Sandbox/permissions        | `opencode.json` contains only `$schema` and `instructions`; no permission rules. No isolation concept documented in `HARNESS_README.md`.                                                                                                                                       |
| Tests today                | 22 unit/component tests in 5 files; 2 Playwright specs. All are mock/localStorage based.                                                                                                                                                                                       |
| Agent/version              | `HARNESS_README.md` states OpenCode 1.18.31, plugin SDK `@opencode-ai/plugin` 1.18.31, model DeepSeek V4.1 Flash 1017. Verified in `.opencode/package.json`.                                                                                                                   |

### 5.2 Harness criteria

| ID     | What must be achieved                                                                                          | How it is verified                                                                                                     | Success                                                                                  | Class                   |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| HAR-1  | At least two **domain-specific** tools are implemented by the team.                                            | Tool source review; tool invocation; demonstration.                                                                    | Two tools exist with domain logic (Pong and Supabase), not only generic script wrappers. | M2                      |
| HAR-2  | The agent reacts to a real verification signal.                                                                | Recorded run log containing a failing check, a subsequent source change, and a passing re-run.                         | Log shows cause, change and re-check; not a synthetic transcript.                        | M2                      |
| HAR-3  | An explicit stop criterion is defined and enforced, and takes effect.                                          | Deliberately exhaust the budget; demonstrate the harness stops and reports.                                            | Stop occurs exactly at the configured limit with a clear report; no further edits.       | M2                      |
| HAR-4  | Sandbox and permission concept is documented **and configured**.                                               | Review `opencode.json` permission config + isolation doc; attempt an allowed, an ask-required, and a forbidden action. | Allowed action runs; ask action prompts; forbidden action is blocked.                    | M2                      |
| HAR-5  | A feature is implemented until the verification signal passes, with its log.                                   | Demonstration + stored run artifact.                                                                                   | Feature passes checks; log is complete and reproducible.                                 | M2                      |
| HAR-6  | Tools emit **structured, actionable** results.                                                                 | Inspect JSON: check id, status, message, remediation, timings, redacted artifacts.                                     | Machine-readable result; non-zero exit on failure; no secret leakage.                    | M2                      |
| HAR-7  | Tools are deterministic and bounded.                                                                           | Repeated runs with same seed/inputs produce same verdict; timeouts respected.                                          | Stable results; bounded runtime; explicit timeout failure.                               | M2                      |
| HAR-8  | Tools are safe by default (target guards, cleanup, no production writes).                                      | Attempt a non-approved/production DB target; inspect guards/cleanup.                                                   | Refuses unsafe target; cleans test data.                                                 | APP                     |
| HAR-9  | Harness documentation states base agent, version, model, install/run, tools, loop, stop criterion and sandbox. | Documentation review (post-approval update of `HARNESS_README.md`; not part of this task).                             | Section present and matches implementation.                                              | M2                      |
| HAR-10 | Repository model follows the project-owner decision: harness and target remain in one repository.              | Documented decision; demonstration reproducible.                                                                       | Single-repository deviation from the assignment is recorded explicitly.                  | ACCEPTED                |
| HAR-11 | Documentation states which parts were agent-generated and how they were reviewed.                              | Documentation review.                                                                                                  | Explicit statement present.                                                              | M2 (`AUFGABE.pdf` §1.2) |
| HAR-12 | The M1 model-selection matrix remains valid for the model used at M2.                                          | Compare `MODEL_SELECTION.md` with actual model in use.                                                                 | Model used is listed; any change documented.                                             | M2                      |
| HAR-13 | Tool unit tests or self-checks exist.                                                                          | Run tool self-checks.                                                                                                  | Tools can verify their own parsers/invariants.                                           | OPT                     |
| HAR-14 | Headless execution is possible for evaluation reuse.                                                           | Run tools headlessly in CI-like shell.                                                                                 | No interactive input required.                                                           | OPT                     |

---

## 6. Two proposed domain-specific tools

Both tools are **proposals**. They must not reuse built-in agent tools, and their logic must live in the repository (TypeScript/JavaScript per the OpenCode plugin model, with any helper scripts allowed). They are **not implemented** by this task.

### 6.1 Tool A — `verify-pong-game`

**Purpose:** Verify the Pong domain rules and simulation invariants headlessly and deterministically, so the agent gets a fast, domain-specific signal distinct from generic unit tests.

| Aspect                        | Specification                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type                          | Domain simulation / scenario verifier                                                                                                                                                                                                                              |
| Location (proposed)           | `.opencode/tools/verify-pong-game.ts` (+ reusable scenario module under `scripts/` or `src/game/`)                                                                                                                                                                 |
| Inputs                        | `scenarios?: string[]` (default: all), `seed?: number` (default fixed), `maxSteps?: number` (default bounded), `deltaSeconds?: number` (fixed 1/60), `format?: 'json' \| 'text'`                                                                                   |
| Outputs                       | Structured JSON: `{ ok, seed, durationMs, scenarios: [{ id, status, steps, assertions: [{ id, ok, expected, actual, message }], finalState }] }`                                                                                                                   |
| Exit codes                    | `0` all pass; `1` assertion failure; `2` invalid input/internal error                                                                                                                                                                                              |
| Verification responsibilities | Deterministic serve; wall bounce; human/AI paddle collision; scoring for both sides; winner at `WINNING_SCORE`; pause does not advance; AI prediction stays within court; speed cap respected; state immutability; finite numbers; scores monotonic; no stuck ball |
| Explicit non-goals            | React rendering, DOM, Supabase, network, visual quality                                                                                                                                                                                                            |
| Why domain-specific           | Encodes Pong rules and invariants; a generic test runner cannot know whether a rally, score or win condition is valid                                                                                                                                              |
| Failure output                | Per-assertion expected/actual and a short remediation hint, e.g. "ball passed paddle without collision at x=…"; never hides failures behind a single boolean                                                                                                       |
| Reproducibility               | Fixed seed + fixed time step; no real-time clock; no `Math.random` outside the seedable source                                                                                                                                                                     |
| Safety                        | Read-only: writes no source files; optional artifact under ignored `test-results/` only                                                                                                                                                                            |

**Minimum scenario set:**

1. Initial state and serve direction.
2. Ball travels according to velocity.
3. Top/bottom wall bounce.
4. Human paddle bounce and AI paddle bounce.
5. Missed paddle yields the correct point.
6. Win at the configured score; game stops.
7. Paused game does not advance.
8. Long-running invariant simulation (bounded steps) with no invalid state.
9. Seeded determinism: same seed → identical final state hash.
10. Regression: score/paddle limits and speed cap.

### 6.2 Tool B — `verify-supabase-backend`

**Purpose:** Verify the Supabase domain: configuration, migrations/schema, auth flows, persistence, leaderboard aggregation, and RLS. This is the domain-specific backend signal the UI cannot provide.

| Aspect                        | Specification                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type                          | Supabase integration / schema / RLS verifier                                                                                                                                                                                                                                                                                                                                                   |
| Location (proposed)           | `.opencode/tools/verify-supabase-backend.ts` (+ helper SQL/test modules)                                                                                                                                                                                                                                                                                                                       |
| Inputs                        | `mode: 'config' \| 'schema' \| 'rls' \| 'integration' \| 'all'` (default `all`), `target: 'dev'` (default and only accepted target in M2), `projectRef` (required, must match the approved development/test project), `seed?: boolean` (default true), `cleanup?: boolean` (default true), `failFast?: boolean`, `timeoutSeconds?: number`                                                     |
| Outputs                       | Structured JSON: `{ ok, target, modes, checks: [{ id, category, status, message, remediation, durationMs, retryable, artifacts? }], durationMs }` with all secrets redacted                                                                                                                                                                                                                    |
| Exit codes                    | `0` all pass; `1` check failure; `2` configuration/target error                                                                                                                                                                                                                                                                                                                                |
| Verification responsibilities | (a) env presence and key classification without printing values; (b) migrations apply to the dedicated development/test project; (c) schema/constraints/indexes; (d) signup/login/logout/session; (e) profile creation; (f) match insert/read; (g) history ordering/ownership; (h) leaderboard aggregates/order; (i) RLS positive/negative for anon/user A/user B; (j) cleanup and idempotency |
| Explicit non-goals            | UI rendering, visual checks, production database writes, load/performance testing                                                                                                                                                                                                                                                                                                              |
| Why domain-specific           | Knows Supabase CLI, migrations, JWT roles (`anon`, `authenticated`), RLS semantics, auth flows, aggregate leaderboard queries, and secret redaction rules                                                                                                                                                                                                                                      |
| Safety/target guard           | No local Supabase. Requires an explicit approved `projectRef` for the dedicated development/test project; refuses production/unknown project refs; clears only data it created                                                                                                                                                                                                                 |
| Secret handling               | Reads keys from environment; never echoes values; classifies as present/absent/misnamed; rejects service-role keys in `VITE_*`                                                                                                                                                                                                                                                                 |
| Failure output                | Check id, violated policy/expectation, expected vs actual, remediation (e.g. "policy `matches_insert_own` missing: user A inserted row for user B")                                                                                                                                                                                                                                            |

**Minimum check set:**

1. `ENV-*`: URL and publishable key present; service-role not client-exposed; no hardcoded credentials.
2. `MIG-*`: migrations apply to the development/test project; migration list; schema version; no drift.
3. `SCHEMA-*`: tables, columns, types, FK, unique, checks, indexes.
4. `AUTH-*`: signup, login, logout, session refresh.
5. `PROFILE-*`: exactly one profile per auth user.
6. `MATCH-*`: own insert works, invalid values rejected.
7. `HIST-*`: own rows only, newest first.
8. `LB-*`: global aggregation and deterministic order.
9. `RLS-*`: each policy tested positively and negatively.
10. `CLEANUP-*`: fixture data removed; rerun produces identical result.

### 6.3 Relationship to the existing tools

| Tool                      | Domain-specific?         | Role in M2                                                                                                                                      |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-project`           | No                       | Supporting inspection tool only; does not count toward HAR-1.                                                                                   |
| `run-pong-checks`         | No (generic npm wrapper) | Supporting aggregator for static checks; does not count toward HAR-1. It may later call the two new tools, but that would be a separate change. |
| `verify-pong-game`        | Yes                      | Counts toward HAR-1.                                                                                                                            |
| `verify-supabase-backend` | Yes                      | Counts toward HAR-1.                                                                                                                            |

---

## 7. Technical quality criteria and testing strategy

### 7.1 Quality gates

| ID    | What must be achieved                                                 | How it is verified                                        | Success                                                                                            | Class  |
| ----- | --------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| TQ-1  | TypeScript strict mode remains enabled; no new `any` at boundaries.   | `npm run typecheck`; review.                              | Exit 0; no unjustified `any`.                                                                      | SPEC   |
| TQ-2  | ESLint passes.                                                        | `npm run lint`.                                           | Exit 0.                                                                                            | SPEC   |
| TQ-3  | Prettier check passes.                                                | `npm run format:check`.                                   | Exit 0.                                                                                            | SPEC   |
| TQ-4  | Production build succeeds.                                            | `npm run build`.                                          | Exit 0; output emitted.                                                                            | SPEC   |
| TQ-5  | New logic has tests at the appropriate layer.                         | Review test diff; coverage of new modules by test files.  | Every new data/auth module has unit or integration tests; every changed page has a component test. | SPEC   |
| TQ-6  | E2E covers the primary user journeys.                                 | `npm run test:e2e`.                                       | Registration/login, match persistence, history, leaderboard pass.                                  | SPEC   |
| TQ-7  | Tests are isolated and do not depend on order or shared remote state. | Repeat runs; random order if available; DB cleanup check. | Stable, repeatable results.                                                                        | APP    |
| TQ-8  | Tests never use production data or credentials.                       | Env/target inspection.                                    | Dedicated development/test project only.                                                           | APP    |
| TQ-9  | No unnecessary dependencies.                                          | `package.json` review; justification per dependency.      | `@supabase/supabase-js` justified by `SPEC` §3; no unrelated additions.                            | AGENTS |
| TQ-10 | No secrets in source, tests, fixtures, logs or build output.          | Grep/bundle scan.                                         | Clean.                                                                                             | SPEC   |
| TQ-11 | Module boundaries remain small and maintainable.                      | Code review.                                              | No page performs raw DB queries; hooks/data layer separated.                                       | AGENTS |
| TQ-12 | Documentation states agent-generated parts and review method.         | Documentation review.                                     | Statement present and accurate.                                                                    | M2     |

### 7.2 Testing strategy

| Layer             | Scope                                                                                    | Tooling                                                        | Data                                                              | Required? |
| ----------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | --------- |
| Unit              | Pure game engine, formatting, validation, score/stat mapping, sort/tie-break, save-guard | Vitest                                                         | In-memory fixtures                                                | Yes       |
| Component         | Login/register/profile/dashboard/leaderboard/game page states with mocked data layer     | Vitest + RTL + jest-dom                                        | Mocked Supabase/data layer                                        | Yes       |
| Domain simulation | Pong rules and invariants                                                                | `verify-pong-game`                                             | Seeded deterministic scenarios                                    | Yes (M2)  |
| DB integration    | Schema, auth, persistence, aggregates                                                    | `verify-supabase-backend` + Vitest integration where practical | Dedicated hosted Supabase development/test project + seeded users | Yes (M2)  |
| RLS/security      | anon/user A/user B policy matrix                                                         | `verify-supabase-backend`                                      | Dedicated hosted Supabase development/test project                | Yes (M2)  |
| End-to-end        | Real browser journeys                                                                    | Playwright against dev server + development/test project       | Seeded demo + new account                                         | Yes       |
| Static            | Types, lint, format, build                                                               | `tsc`, ESLint, Prettier, Vite                                  | N/A                                                               | Yes       |

**Test data rules:** unique per-run identifiers; cleanup after run; no real emails; no shared fixed rows that could collide across parallel workers; Playwright uses separate users per test or serialised DB setup. Because Supabase is hosted, tests must target only the approved development/test project, must never touch production, and must tolerate concurrent team members by cleaning up their own fixtures.

**Coverage policy:** no arbitrary numeric gate is mandated. Proposed minimum: every new data-access/auth module has at least one success and one failure test; every RLS policy has positive and negative tests. Any numeric threshold is `OPT` and needs approval.

---

## 8. Verification loop

### 8.1 Signal contract

Every check returns a structured result with at least:

```json
{
  "id": "RLS-MATCH-INSERT-OWN",
  "status": "fail",
  "message": "user A could insert a match for user B",
  "expected": "insert rejected",
  "actual": "insert succeeded",
  "remediation": "add/repair policy matches_insert_own",
  "retryable": true,
  "durationMs": 42
}
```

The agent must react to the **specific failing check**, not only to a process exit code.

### 8.2 Check order (cheap and deterministic first)

| Order | Check                        | Command / tool                          | On failure                           |
| ----: | ---------------------------- | --------------------------------------- | ------------------------------------ |
|     1 | Format                       | `npm run format:check`                  | Auto-format only if approved; re-run |
|     2 | Typecheck                    | `npm run typecheck`                     | Fix types; re-run                    |
|     3 | Lint                         | `npm run lint`                          | Fix; re-run                          |
|     4 | Unit/component               | `npm test`                              | Fix; re-run                          |
|     5 | Domain simulation            | `verify-pong-game`                      | Fix engine/UI change; re-run         |
|     6 | Schema/migrations            | `verify-supabase-backend` mode `schema` | Fix migration; re-apply and re-run   |
|     7 | Auth/persistence/leaderboard | mode `integration`                      | Fix client/data layer; re-run        |
|     8 | RLS/security                 | mode `rls`                              | Fix policies; re-run                 |
|     9 | E2E                          | `npm run test:e2e`                      | Fix UI/integration; re-run           |
|    10 | Build                        | `npm run build`                         | Fix; re-run                          |

### 8.3 Loop rules

| ID   | Rule                                                                                                                                                            | Class        |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| VL-1 | The agent must run the relevant checks **before** claiming a feature is done.                                                                                   | M2           |
| VL-2 | After any source/configuration change, re-run the failed check **and** all lower-order checks that could be affected.                                           | M2           |
| VL-3 | A check must not be "fixed" by disabling, skipping, weakening or deleting it. Any test change must preserve or increase verification strength and be justified. | M2 (honesty) |
| VL-4 | Failures are addressed at the root cause; retrying without a change is not a fix.                                                                               | M2           |
| VL-5 | Each task run records: task, checks run, failure excerpts (redacted), changes made, final status, iterations used, stop reason.                                 | M2           |
| VL-6 | Evidence artifacts are written only to an ignored directory (e.g. `test-results/verification/`) and contain no secrets.                                         | PROPOSED     |
| VL-7 | The M2 demonstration must include one genuine failure that is fixed and re-verified.                                                                            | M2           |

---

## 9. Stop criterion

### 9.1 Selected criterion

The selected M2 stop criterion is the native OpenCode agent step limit:

- `opencode.json` sets `agent.build.maxSteps` to **30** for OpenCode 1.18.31 (V1 configuration).
- The pinned V1 schema accepts `maxSteps` and normalizes it to `steps`; the resolved config shows `agent.build.maxSteps: 30` and `agent.build.steps: 30`.
- 30 model steps allows normal implementation and verification while preventing unlimited agent execution.
- This is a **step limit**, not a custom verification-retry counter. No custom orchestration layer is implemented.

### 9.2 Behaviour at the limit

- On the final allowed step, OpenCode removes tools and asks the model for a text-only summary.
- The run cannot make further tool calls after the limit.
- If work remains unfinished, the agent must report that instead of bypassing the limit.
- Do not report success when work is incomplete.

### 9.3 Enforcement and evidence

| ID       | What must be achieved                                              | How it is verified                                                                                                       | Success                                                  | Class |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ----- |
| SC-ENF-1 | The criterion is configured in the harness and loaded by OpenCode. | `opencode debug config` shows `agent.build.steps: 30`.                                                                   | Setting is present in the resolved config.               | M2    |
| SC-ENF-2 | The criterion demonstrably takes effect.                           | Run a headless task with a temporary lower limit and capture the forced final summary and absence of further tool calls. | Stop is visible at the configured limit.                 | M2    |
| SC-ENF-3 | The limit is documented in `AGENTS.md` and `HARNESS_README.md`.    | Documentation review.                                                                                                    | Limit, purpose, and demonstration method are documented. | M2    |

**Evidence status:** the configuration is loaded and verified; the live stop demonstration is still required. A custom retry counter is not part of M2.

---

## 10. Sandbox and permission policy

OpenCode does not provide a sandbox of its own in this setup; isolation must be stated and enforced by configuration and wrappers (`AUFGABE.pdf` §2.3). The following is **proposed** and must be approved, then configured outside this documentation task.

### 10.1 Isolation model

- The agent works **only inside the project directory**; paths outside it are denied or require confirmation by permission rules and tool wrappers.
- Database work targets the **dedicated hosted Supabase development/test project**. No production credentials are ever present.
- Verification tools validate the target and refuse any project ref other than the approved development/test project.
- Test data is created and cleaned up by the tools; no manual shared state.
- Secrets come from environment or a gitignored `.env.local`; they are never written to artifacts.

### 10.2 Permission matrix (proposed)

| Action class                             | Examples                                                                                      | Policy                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Read project files                       | `src/**`, `e2e/**`, `package.json`, migrations                                                | Allow                                                                   |
| Static checks                            | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run format:check`      | Allow                                                                   |
| Domain verifiers                         | `verify-pong-game`; `verify-supabase-backend` with `target=dev` and the approved `projectRef` | Allow                                                                   |
| Read-only Git                            | `git status`, `git diff`, `git log`                                                           | Allow                                                                   |
| Local dev server                         | `npm run dev` on localhost                                                                    | Allow (bounded)                                                         |
| Network to the approved Supabase project | Keystore/API host of the approved development/test project                                    | Allow                                                                   |
| Install/remove packages                  | `npm install`, `npm uninstall`                                                                | Ask                                                                     |
| Add/change migrations                    | Creating SQL migrations; applying them to the development/test project                        | Ask; **Deny** for production/unknown projects                           |
| Read/edit `.env*`                        | Agent file tools and shell                                                                    | **Deny** for the agent; tools may load into process; never print values |
| Other Supabase projects                  | `supabase link`, `db push`, queries against any other project                                 | Ask; denied unless explicitly approved                                  |
| Browser install                          | `npx playwright install`                                                                      | Ask                                                                     |
| Destructive shell                        | `rm -rf`, `git reset --hard`, `git clean -fdx`                                                | Deny                                                                    |
| Git write history                        | `git commit`, `git push`, force-push, rebase                                                  | Deny unless explicitly requested                                        |
| Secrets                                  | Printing, committing, logging, bundling service-role key                                      | Deny                                                                    |
| Writes outside project                   | `/tmp` outside approved dir, home config, system paths                                        | Deny                                                                    |
| Changing permissions/config              | Editing `opencode.json` permission rules                                                      | Deny for the agent                                                      |
| Arbitrary network                        | Any non-allowlisted host/upload                                                               | Deny                                                                    |

**Implemented:** `opencode.json` uses the V1 `permission` object for OpenCode 1.18.31. The pinned V1 schema (`@opencode-ai/core/v1/config/permission`) was verified; V2 `permissions`/`shell`/`subagent` syntax is not used. The implemented matrix, limitations, and approved Supabase project are documented in `HARNESS_README.md` §12 and `harness.config.json`.

### 10.3 Permission acceptance criteria

| ID   | What must be achieved                                            | How it is verified                             | Success                                       | Class    |
| ---- | ---------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- | -------- |
| SB-1 | Allowed actions run without prompts.                             | Run static checks/tools.                       | No unnecessary prompts.                       | M2       |
| SB-2 | Ask-required actions prompt and can be denied.                   | Trigger `npm install`/remote access in a test. | Prompt appears; denial aborts safely.         | M2       |
| SB-3 | Forbidden actions are blocked.                                   | Attempt destructive command/secret printing.   | Blocked with a clear message; no side effect. | M2       |
| SB-4 | The concept is documented (allow/ask/deny + isolation).          | Documentation review.                          | Matches configured rules.                     | M2       |
| SB-5 | Tools enforce their own guards in addition to agent permissions. | Attempt remote DB target with the tool.        | Tool refuses independently.                   | PROPOSED |
| SB-6 | Secret redaction is verified.                                    | Run tool with sentinel secret; scan output.    | Sentinel absent from output/artifacts.        | PROPOSED |

---

## 11. Final demonstration checklist

The M2 demo must be rehearsable and reproducible. Each item needs a visible result.

### 11.1 Harness demonstration

- [ ] **DEMO-1** Show harness configuration: base agent OpenCode 1.18.31, model in use, `opencode.json`, tool directory.
- [ ] **DEMO-2** Invoke `check-project` (supporting tool) and show structured project info.
- [ ] **DEMO-3** Invoke `verify-pong-game` on a green baseline; show structured `ok: true`.
- [ ] **DEMO-4** Introduce a deliberate domain defect (e.g. wrong `WINNING_SCORE` handling) and run `verify-pong-game`; show a specific failing assertion.
- [ ] **DEMO-5** Let the agent fix the defect and re-run; show pass. Save the log.
- [ ] **DEMO-6** Invoke `verify-supabase-backend` against the green development/test project.
- [ ] **DEMO-7** Break a migration or RLS policy; show `schema`/`rls` failure with expected vs actual.
- [ ] **DEMO-8** Fix and re-run; show pass.
- [ ] **DEMO-9** Demonstrate the native step limit: use a temporary lower `agent.build.maxSteps` (for example via `OPENCODE_CONFIG_CONTENT`) on a task that would exceed it, then show the forced final text-only summary and the absence of further tool calls. Keep the committed limit at 30 and record the evidence.
- [ ] **DEMO-10** Trigger one allowed, one ask-required, and one forbidden action; show the permission behaviour.

### 11.2 Application demonstration

- [ ] **DEMO-11** Register a new user; show a profile row created in Supabase.
- [ ] **DEMO-12** Log out and log in; reload; session persists.
- [ ] **DEMO-13** Play a match to the winning score; show the stored match row and winner.
- [ ] **DEMO-14** Open history; show the match; reload and show persistence.
- [ ] **DEMO-15** Log in as a second user; play a match; show the global leaderboard updated for both users.
- [ ] **DEMO-16** Show statistics on dashboard/profile match the stored rows.
- [ ] **DEMO-17** Attempt an unauthorized action (e.g. anonymous read/write or user A accessing B's raw matches); show denial.
- [ ] **DEMO-18** Show that only the publishable key is in the client bundle; show `.env.local` is untracked and history is clean.

### 11.3 Evidence package

- [ ] Verification logs for DEMO-3 to DEMO-9 (redacted).
- [ ] Migration files and schema snapshot.
- [ ] Test run outputs for typecheck, lint, unit, E2E, build.
- [ ] RLS test matrix output.
- [ ] Stop-criterion output.
- [ ] Screenshots/clip of the app flows.
- [ ] Updated documentation (to be done in the implementation phase, not this task).

---

## 12. Dependencies, assumptions and unresolved decisions

### 12.1 Dependencies

| ID    | Dependency                                          | Needed for                                                            | State                                                                                 |
| ----- | --------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| DEP-1 | `@supabase/supabase-js`                             | Auth, DB client                                                       | Not installed; required by `SPEC` §3 (proposed version pinned at implementation time) |
| DEP-2 | Supabase CLI                                        | Applying/validating migrations on the hosted development/test project | Not present in `package.json`; installation method to decide                          |
| DEP-3 | Hosted Supabase development/test project            | Auth, database, RLS and integration tests                             | No local Supabase; project ref and credentials must be provided                       |
| DEP-4 | Node.js 20.19+ / 22.12+                             | Vite/Vitest/Playwright                                                | Declared in `README.md`; verify on demo machine                                       |
| DEP-5 | OpenCode 1.18.31 + `@opencode-ai/plugin` 1.18.31    | Harness/tools                                                         | Plugin version pinned in `.opencode/package.json`                                     |
| DEP-6 | Playwright Chromium                                 | E2E                                                                   | Install step exists in `README.md`                                                    |
| DEP-7 | Seeded demo account in the development/test project | Demo/E2E                                                              | To be decided (APP-AUTH-7)                                                            |
| DEP-8 | Tool runtime for TypeScript tools                   | New tools                                                             | Existing `.opencode` setup; whether extra runtime is needed is unresolved             |

### 12.2 Assumptions

| ID    | Assumption                                                                                                   | Risk if wrong                                       |
| ----- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| ASM-1 | A dedicated hosted Supabase development/test project (no local instance, no production) is available for M2. | DB/RLS verification cannot run; M2 demo incomplete. |
| ASM-2 | The publishable key with RLS is the only client-side credential.                                             | Redesign/backend proxy needed; out of M2 scope.     |
| ASM-3 | The existing game engine remains the game source of truth.                                                   | Scope/time risk.                                    |
| ASM-4 | The harness can invoke Node-based tools headlessly.                                                          | Verification loop impractical.                      |
| ASM-5 | The team accepts the M2 deadline of 2026-11-15 and the scope in §2–4.                                        | Scope must be cut and documented honestly.          |
| ASM-6 | Supabase email confirmation can be configured so demos do not require mailbox access.                        | Demo friction; needs seeded/confirmed users.        |
| ASM-7 | No production data or production credentials are used.                                                       | Safety risk; forbidden by policy.                   |

### 12.3 Conflicts and uncertainties (must be resolved or documented)

| ID     | Conflict / uncertainty                                                                                                              | Evidence                                    | Impact / status                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CON-1  | Assignment expects a **separate harness repository** and target repository; this project integrates harness and target in one repo. | `AUFGABE.pdf` §1/§2; repository layout      | **Resolved (accepted):** project owner confirmed no separate harness repo is needed. Single-repo deviation is documented (HAR-10). |
| CON-2  | `README.md` said there is **no Supabase/backend**; `PROJECT_SPEC.md` requires Supabase Auth/PostgreSQL.                             | `README.md`; `PROJECT_SPEC.md` §3           | **Resolved:** Supabase will be used; README now states the current mock state and the Supabase target.                             |
| CON-3  | `result.txt` said "no game physics, manual scoring, match to 11"; code has physics and `WINNING_SCORE = 5`.                         | Deleted `result.txt`; `src/game/pong.ts:11` | **Resolved:** `result.txt` deleted.                                                                                                |
| CON-4  | Existing harness tools are generic; M1 tool counts only if domain-specific.                                                         | `.opencode/tools/*`; `AUFGABE.pdf` §2.3     | Open: HAR-1 requires two new domain tools.                                                                                         |
| CON-5  | Mock auth/localStorage/demo password vs real Supabase auth.                                                                         | `AuthProvider.tsx`                          | Open for implementation: APP-AUTH-5; demo account must be re-created safely.                                                       |
| CON-6  | Leaderboard needs global aggregates, but match history is private.                                                                  | `SPEC` §2.3 + security goal                 | Open: RLS design trade-off (SEC-RLS-7/11).                                                                                         |
| CON-7  | Client-only app: service-role key cannot exist client-side; anti-cheat impossible.                                                  | Architecture                                | **Resolved (accepted):** anti-cheat is explicitly not required; RLS remains the only write authorization (SEC-RISK-1).             |
| CON-8  | `MatchRecord.mode` has `Ranked/Friendly/Tournament`, but the game is solo vs AI.                                                    | `src/types.ts`; `GamePage.tsx`              | Open: mode mapping undefined (DEC-8).                                                                                              |
| CON-9  | Mock scores go to 11, engine wins at 5.                                                                                             | `mockData.ts`; `pong.ts:11`                 | Open: persist/display must follow one decided rule (APP-MATCH-5).                                                                  |
| CON-10 | `User.stats.rank` is static mock data; global rank must be computed.                                                                | `mockData.ts`; `types.ts`                   | Open: APP-STAT-4.                                                                                                                  |
| CON-11 | Exact OpenCode 1.18.31 permission configuration syntax is not verified.                                                             | `opencode.json` has no permissions          | Open: SB-* configuration risk.                                                                                                     |
| CON-12 | `requirementsm2.md` was empty and gitignored.                                                                                       | Deleted by project owner                    | **Resolved:** file removed; no longer a source or dependency.                                                                      |
| CON-13 | No local Supabase is available/wanted.                                                                                              | Project-owner decision                      | **Resolved:** integration and tests use the dedicated hosted development/test project; no Docker dependency.                       |
| CON-14 | Assignment requires a statement of agent-generated parts and review; current docs lack it.                                          | `AUFGABE.pdf` §1.2                          | Open: HAR-11, TQ-12.                                                                                                               |
| CON-15 | M2 upload deadline is 2026-11-15, one day after this document.                                                                      | `AUFGABE.pdf` §2.3; current date            | Open: scope/approval urgency.                                                                                                      |
| CON-16 | `PROJECT_SPEC.md` contains `HARNESS_VERIFICATION_CODE: PONG-AGENT-HARNESS-1823585` with no stated use.                              | `PROJECT_SPEC.md`                           | Open: must be preserved; purpose unresolved.                                                                                       |

### 12.4 Decisions requiring approval

| ID     | Decision                                                                            | Recommended default                                                                                    | Needed by               |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| DEC-1  | ~~Split harness into its own repository~~                                           | **Resolved:** single repository is accepted by the project owner; record the deviation                 | Done                    |
| DEC-2  | Tool names/locations and invocation contract for the two new tools.                 | `verify-pong-game`, `verify-supabase-backend` as specified in §6                                       | Before implementation   |
| DEC-3  | Stop-criterion limit.                                                               | **Resolved:** native `agent.build.maxSteps = 30` (step limit; no custom retry counter)                 | Done                    |
| DEC-4  | Enforcement location for the stop criterion.                                        | **Resolved:** OpenCode V1.18.31 native agent step limit, configured in `opencode.json`                 | Done                    |
| DEC-5  | Points formula and tie-breakers.                                                    | Points = 3 per win, 1 per loss (or approved alternative); tie-break wins, then username                | Before leaderboard work |
| DEC-6  | Profile creation mechanism.                                                         | DB trigger on `auth.users` (atomic, no client race)                                                    | Before migrations       |
| DEC-7  | Leaderboard exposure model.                                                         | Security-definer view/RPC exposing username + aggregates only                                          | Before RLS              |
| DEC-8  | Match `mode` value(s) for solo AI.                                                  | Add/rename to `'Solo'`; keep others only if supported                                                  | Before persistence      |
| DEC-9  | Email confirmation in demo/test environments.                                       | Disabled for the development/test project where possible; otherwise seeded confirmed demo user         | Before E2E              |
| DEC-10 | Demo account strategy.                                                              | Seeded Supabase user in the development/test project only, not hardcoded credentials                   | Before demo             |
| DEC-11 | DB test target.                                                                     | **Resolved:** dedicated hosted Supabase development/test project (no local instance, never production) | Done                    |
| DEC-12 | Repository secret handling for tool/service-role use.                               | Service role only in harness process env, never `VITE_*`, never logged                                 | Before tool B           |
| DEC-13 | Whether to keep optional profile editing/bio fields.                                | Defer; not required for M2                                                                             | Before UI work          |
| DEC-14 | Coverage threshold, if any.                                                         | No numeric gate; per-module success/failure tests required                                             | Before implementation   |
| DEC-15 | Documentation update scope (`README.md`, `HARNESS_README.md`) after implementation. | Rewrite stale claims; add M2 sections (README already updated for the Supabase target)                 | Before submission       |

---

## Appendix A — Traceability: M2 assignment → DoD

| Assignment requirement (`AUFGABE.pdf` §2.3)                | DoD criteria                          |
| ---------------------------------------------------------- | ------------------------------------- |
| At least two domain-specific tools implemented by the team | HAR-1, TOOL A §6.1, TOOL B §6.2, §6.3 |
| Verification signal the agent reacts to                    | HAR-2, VL-1…VL-7, §8                  |
| Log shows failing signal → change → re-check               | HAR-2, VL-5, VL-7, DEMO-4/5/7/8       |
| Explicit stop criterion and evidence it takes effect       | HAR-3, §9, SC-ENF-1…3, DEMO-9         |
| Documented and configured sandbox/permission concept       | HAR-4, §10, SB-1…SB-6, DEMO-10        |
| Demonstration: implement feature until signal passes + log | HAR-5, §11, DEMO-1…DEMO-18            |

## Appendix B — Specification traceability

| `PROJECT_SPEC.md` requirement                                       | DoD criteria                                      |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| §2.1 Browser-playable game, results capture                         | APP-GAME-1/2                                      |
| §2.2 Register/login/logout, profile with username                   | APP-AUTH-1/2/3/5, APP-PROF-1/2/3, DB-1, DB-AUTH-1 |
| §2.3 Persistent results/highscores                                  | APP-MATCH-1..5, DB-PERSIST-1..3                   |
| §2.3 Global leaderboard from shared DB                              | APP-LB-1..4, DB-CLIENT-4, SEC-RLS-7               |
| §3 Supabase Auth/PostgreSQL; Vitest/RTL/Playwright; ESLint/Prettier | DB-*, TQ-1..TQ-6                                  |
| §4 Modular, TypeScript, tested, no secrets, secure DB, browser      | TQ-7..TQ-11, SEC-1..5, SEC-RLS-*                  |
| §5 Focus on core game/auth/leaderboard                              | Scope in §1.2; `OPT` items excluded               |

## Appendix C — Current baseline gap summary

| Area                | Current state                                                                         | M2 target                              |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| Auth                | Mock provider, in-memory accounts, `localStorage` user object, demo password constant | Supabase Auth + session                |
| Data                | `src/data/mockData.ts`; hardcoded leaderboard/history                                 | PostgreSQL + RLS                       |
| Persistence         | None for matches; session only                                                        | Durable matches/profiles               |
| Leaderboard         | Hardcoded + appended current user                                                     | DB aggregate for all users             |
| Statistics          | Static stats in `demoUser`; new users zeroed                                          | Derived from matches                   |
| Harness tools       | 2 generic tools                                                                       | +2 domain-specific tools               |
| Verification loop   | No recorded fail→fix→pass evidence                                                    | Recorded evidence                      |
| Stop criterion      | None                                                                                  | Enforced via runner                    |
| Permissions/sandbox | No permission config; no isolation doc                                                | Configured + documented                |
| Tests               | 22 unit/component (mock-based), 2 Playwright specs                                    | Extended with DB/RLS/simulation layers |

## Appendix D — Evidence artifact template

Each task run should produce an artifact with this shape (secrets redacted):

```json
{
  "task": "persist match result",
  "startedAt": "2026-11-15T10:00:00Z",
  "iterations": [
    {
      "n": 1,
      "checks": [
        {
          "id": "verify-pong-game",
          "status": "fail",
          "failures": ["SCORE-001"]
        },
        { "id": "typecheck", "status": "pass" }
      ],
      "change": "fix winner detection before persistence",
      "evidence": "test-results/verification/run-1.json"
    },
    {
      "n": 2,
      "checks": [{ "id": "verify-pong-game", "status": "pass" }],
      "change": "none",
      "evidence": "test-results/verification/run-2.json"
    }
  ],
  "status": "done"
}
```

For the stop-criterion evidence, record the configured `agent.build.maxSteps`, the observed model steps, and evidence that the final step was text-only with no further tool calls. No custom retry counter or `stopReason` field is used.
