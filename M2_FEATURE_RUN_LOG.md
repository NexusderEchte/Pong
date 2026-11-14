# M2 Feature Run Log — Match-History Persistence

This log records the agent implementing one feature of the Pong target software with the harness, for M2 Requirement 4 (`AUFGABE.pdf` §2.3): "A demonstration in which the agent, running with your harness, implements one feature of your target software until the verification signal passes, plus the log of that run."

No timestamps, screenshots, or results are invented below. The command results are the outputs observed during this session.

## 1. Feature implemented

Persist and display Pong match history in Supabase.

Before this change, match history was mock data:

- `src/pages/ProfilePage.tsx` and `src/pages/DashboardPage.tsx` called `getMatchHistory()` from `src/data/mockData.ts`.
- `getMatchHistory()` returned the fixed `matchHistory` fixtures only for the demo user and an empty array for real users.
- The `public.games` table stored only `username` and `score`, so a finished match could not be reconstructed as an opponent, score line, mode, and date.

After this change:

- A finished match is written to `public.games` with `username`, `score`, `opponent`, `opponent_score`, `mode`, and a server timestamp.
- The signed-in player's history is read from `public.games` and mapped to `MatchRecord`, newest first.
- `ProfilePage` (full match history) and `DashboardPage` (recent results) render the persisted rows.
- An error state is shown if the history cannot be loaded.

## 2. Files changed

### New

| File                                                              | Purpose                                                                                                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20261114180000_add_match_history_fields.sql` | Adds `opponent`, `opponent_score`, `mode`, and `created_at` to `public.games` with defaults, so existing rows and the existing leaderboard/verification inserts remain valid. |
| `src/lib/matchHistory.ts`                                         | Pure row-to-`MatchRecord` mapping (`toMatchRecord`) and the row type.                                                                                                         |
| `src/lib/matchHistory.test.ts`                                    | Unit tests for win/loss mapping, known mode, and unknown-mode fallback.                                                                                                       |
| `src/data/matches.ts`                                             | `fetchMatchHistory(username)` read path using the existing Supabase client.                                                                                                   |
| `src/lib/useMatchHistory.ts`                                      | Small React hook that loads history and exposes `{ history, error }`.                                                                                                         |
| `M2_FEATURE_RUN_LOG.md`                                           | This run log.                                                                                                                                                                 |

### Modified

| File                                 | Change                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/GamePage.tsx`             | The finished-game insert now writes `opponent`, `opponent_score`, and `mode` in addition to `username` and `score`; the effect dependency list includes `game.scores.ai`. |
| `src/pages/ProfilePage.tsx`          | Uses `useMatchHistory` instead of `getMatchHistory`; shows a load-error state.                                                                                            |
| `src/pages/DashboardPage.tsx`        | Uses `useMatchHistory` for recent results; shows a load-error state.                                                                                                      |
| `src/test/supabaseMock.ts`           | Query mock supports `.order()`; `.select()` resets the result set so a prior `.insert()` does not leak into a later read.                                                 |
| `src/pages/GamePage.result.test.tsx` | Asserts the expanded persistence payload.                                                                                                                                 |
| `src/pages/ProfilePage.test.tsx`     | Empty history is awaited; new test asserts persisted rows render as a table.                                                                                              |
| `README.md`                          | States that match history is loaded from `public.games`; player statistics remain mock data.                                                                              |
| `M2_EVIDENCE.md`                     | References this run log for Requirement 4.                                                                                                                                |

No harness configuration, harness tools, dependencies, or unrelated application functionality were changed.

## 3. Verification signal

The configured verification signal for this feature is the project test suite, supported by the existing harness tool `verify-pong-game`:

| Check                  | Command / tool      | Result                                                   |
| ---------------------- | ------------------- | -------------------------------------------------------- |
| Unit/component tests   | `npm test`          | 8 test files passed; 38 tests passed                     |
| Type checker           | `npm run typecheck` | Exit 0 (`tsc -b`)                                        |
| Linter                 | `npm run lint`      | Exit 0 (`eslint .`)                                      |
| Production build       | `npm run build`     | Exit 0; Vite built 89 modules and emitted `dist/` assets |
| Domain simulation tool | `verify-pong-game`  | `ok: true`; 5/5 scenarios passed                         |

## 4. Red-to-green record

The first verification run after the initial implementation did not pass. The failures and corrections are recorded here.

### First `npm test`

Observed result:

```text
Test Files  1 failed | 7 passed (8)
Tests       1 failed | 37 passed (38)
```

Failure: `src/App.test.tsx:119` could not find `No matches yet` during the registration flow.

Cause: the test Supabase mock reused one query object whose `insert()` call changed the shared pending result. The dashboard's new history read then received the inserted profile object instead of an array.

Correction: `createUsersQuery().select()` now resets the pending result set to the configured list result, so a read after an insert returns the read result.

### First `npm run lint`

Observed result:

```text
src/pages/DashboardPage.tsx  31:44  error  React Hook "useMatchHistory" is called conditionally
src/pages/ProfilePage.tsx    32:44  error  React Hook "useMatchHistory" is called conditionally
src/pages/GamePage.tsx      153:6   warning  React Hook useEffect has a missing dependency: 'game.scores.ai'
✖ 3 problems (2 errors, 1 warning)
```

Cause: the hook was called after the `if (!user) return null;` early return, and the persistence effect used `game.scores.ai` without listing it.

Correction: call `useMatchHistory(user?.username)` before the early return in both pages, and add `game.scores.ai` to the effect dependencies.

### Final verification run

After the corrections, all checks passed:

```text
npm run typecheck   → exit 0
npm run lint        → exit 0
npm test            → Test Files 8 passed (8); Tests 38 passed (38)
npm run build       → ✓ 89 modules transformed; ✓ built
verify-pong-game    → ok: true; total 5, passed 5, failed 0
```

## 5. Limitations

- At the time of the feature run, the migration file had been added to the repository but was **not applied** to the hosted Supabase development/test project. It was applied afterwards and verified; see §6.
- The automated persistence checks in the run above use the mocked Supabase client. `verify-supabase-backend` was not part of that run; it was run later and passed 10/10, but it verifies RLS, ownership and cleanup, not the new columns. Column presence and migration history were verified separately; see §6.
- `verify-pong-game` verifies the Pong engine simulation, not the database path. The feature's write/read behavior is covered by the component and unit tests listed above.

## 6. Post-run verification — migration and backend

The pending match-history migration was applied to the approved project `jbkneqrbjuquvpxrufzu` after the feature run. Verification results:

- `public.games` contains `opponent`, `opponent_score`, `mode`, and `created_at`; a read-only select of all seven columns returned HTTP 200.
- The remote migration history matches the local migrations: `20261114162000` and `20261114180000` are recorded with matching local/remote versions.
- `verify-supabase-backend` returned `ok: true` with all 10/10 checks passed, including deletion of the temporary test record.
- The latest test suite has 11 test files and 73 tests passing. The original feature run in §3–§4 recorded 8 files and 38 tests; the additional tests cover later application work.

This does not change the historical red-to-green record in §4.

## 7. Requirement 4 conclusion

The agent implemented one feature of the Pong target software (match-history persistence) within the existing React/Supabase architecture, added tests, and iterated until the verification signal passed. This log is the recorded run for M2 Requirement 4.
