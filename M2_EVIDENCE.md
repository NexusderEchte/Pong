# M2 Evidence

This file consolidates the M2 demonstrations that have actually been completed. It separates confirmed results from limitations and from items that are not yet evidenced.

## 0. Evidence conventions

- **Confirmed** — observed directly and/or re-checked against the current repository during consolidation.
- **Recorded demonstration** — result produced by the M2 demonstration run. It is not re-executed here when doing so would write to the database or temporarily change configuration.
- **Not demonstrated** — no evidence yet; it must not be claimed.

No timestamps, screenshots, or evidence files are invented. Where a run output is the evidence, that is stated plainly. No artifact file is claimed to exist in this repository unless it does.

## 1. Domain-specific verification tools

### 1.1 `verify-pong-game` — 5/5 scenarios passed

Recorded demonstration result: `ok: true`, `total: 5`, `passed: 5`, `failed: 0`.

| Scenario            | Status |
| ------------------- | ------ |
| `paddle-collision`  | passed |
| `wall-collision`    | passed |
| `scoring`           | passed |
| `winning-condition` | passed |
| `pause`             | passed |

Re-confirmed during consolidation by running the tool (read-only): `summary.total = 5`, `passed = 5`, `failed = 0`.

### 1.2 `verify-supabase-backend` — 10/10 checks passed

Recorded demonstration result: 10/10 checks passed against the approved development/test project `jbkneqrbjuquvpxrufzu`, including successful cleanup of the temporary record.

| #   | Check id                         |
| --- | -------------------------------- |
| 1   | `project-config`                 |
| 2   | `test-credentials`               |
| 3   | `test-account-sign-in`           |
| 4   | `test-user-profile`              |
| 5   | `authenticated-read-games`       |
| 6   | `insert-own-game`                |
| 7   | `read-own-test-record`           |
| 8   | `anonymous-read-denied`          |
| 9   | `foreign-username-insert-denied` |
| 10  | `cleanup-test-record`            |

The tool is target-guarded: it reads `approvedSupabaseProjectRef` from `harness.config.json`, rejects any ref other than the approved one, and refuses service-role or secret keys.

**Not re-run during consolidation:** the tool creates and then deletes a row in `public.games`; database modification was out of scope for this documentation task.

## 2. Agent feedback loop

Task: `verify-pong-game`.

- **Baseline:** 5/5 scenarios passed.
- **Controlled fault (temporary, harness tool only):** the `human-paddle-keeps-ball-in-court` assertion in `.opencode/tools/verify-pong-game.ts` was changed from `x > 8` to `x > 100`. No application or game logic was changed.
- **Failure observed:** the scenario failed and the assertion reported expected `x > 100` with actual `8.25`. The actual value is the ball position after the human-paddle collision, printed to two decimals by the tool.
- **Correction:** the assertion was reverted to `x > 8`.
- **Re-run:** 5/5 scenarios passed.
- **Reversion confirmed:** the current source asserts `x > 8` (`.opencode/tools/verify-pong-game.ts:123-128`), and the current run passes that assertion with actual `8.25`.

No residual change from the temporary assertion remains. The fault was confined to the verification tool and did not touch the game implementation.

## 3. Stop criterion

- The criterion is OpenCode's native agent step limit (`agent.build.maxSteps`).
- Permanent configuration: `agent.build.maxSteps = 30` in `opencode.json` (unchanged).
- Demonstration: one run used a temporary `agent.build.maxSteps = 3`.
- Observed output: the run explicitly stated that the maximum step budget was reached and that tools were disabled; the final stop reason was `stop`.
- No files were modified by the demonstration, and the temporary override was not committed.
- This is a model-step budget, not a custom verification-retry counter.

## 4. Permission behaviour

| Action                  | Observed result                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`     | Allowed; ran without a prompt.                                                                                                                     |
| `npm install --dry-run` | OpenCode evaluated the rule as `ask` and emitted a permission request. The JetBrains ACP client resolved the request as allow, so the command ran. |
| `git push`              | Denied before execution by the `git *` deny rule; the command did not run.                                                                         |

`ask` is delegated to the ACP client: OpenCode emits the permission request and the client decides. In this session the JetBrains ACP client did not display an approval prompt; it resolved the request as allow. Therefore:

- The `ask` evaluation and the existence of the permission request are confirmed.
- The approval prompt itself was **not** demonstrated.
- A server-side `deny` is enforced by OpenCode regardless of the client, which is why `git push` was blocked.

## 5. Configuration state

- `agent.build.maxSteps = 30` (permanent).
- Permission rules are unchanged from the M2 configuration in `opencode.json`.
- `harness.config.json` still targets the approved project `jbkneqrbjuquvpxrufzu`.
- No application code, database, or configuration was modified to produce this evidence.

## 6. Environment

- Running agent: OpenCode ACP `1.19.3` (JetBrains IntelliJ ACP agent).
- CLI / `opencode debug config`: `1.18.31`.
- The version difference is recorded here. It is not claimed as the cause of any failure; the project permission configuration was evaluated as configured in both the session evidence and the resolved configuration.

## 7. Sandbox limitation

Permission control is **application-level**, not OS-level isolation. No container, VM, or separate OS user is used. Allowed commands run with the host user's filesystem, process, and network authority. The permission rules and shell scanner are best-effort guardrails, not a security boundary against a malicious or deliberately obfuscated command.

## 8. Remaining evidence gaps

- **ACP approval prompt:** not demonstrated. The `ask` request was auto-resolved to allow by the JetBrains ACP client without a visible prompt, so SB-2 is only partially evidenced.
- **Migration/RLS failure and fix (DEMO-7/DEMO-8):** no evidence of breaking and then fixing a migration or RLS policy.
- **Application demos (DEMO-11 to DEMO-18):** registration/profile persistence, session persistence, two-user leaderboard, statistics, unauthorized-access denial, and the client-bundle key check are not documented here as completed. The schema and backend path are verified live (§9), but a full browser end-to-end demo of these application flows is not recorded.
- **Supporting harness demos:** `check-project` (DEMO-2) is not included in this evidence set.
- **Stored artifacts:** the feedback-loop and stop-criterion outputs were observed during their runs; no separate redacted raw log files are committed. The Requirement 4 feature run is recorded in `M2_FEATURE_RUN_LOG.md`.
- **Optional harness criteria:** HAR-13 (tool self-checks) and HAR-14 (headless execution) are not evidenced.

## 9. Requirement 4 — Target-software feature run

`M2_FEATURE_RUN_LOG.md` records the agent implementing one feature of the Pong target software with the harness: **match-history persistence**.

- **Feature:** finished matches are written to `public.games` with `opponent`, `opponent_score`, `mode`, and a server timestamp; `ProfilePage` and `DashboardPage` load the signed-in player's history from Supabase instead of mock data.
- **Verification signal (feature run):** `npm test` (8 files, 38 tests at the time), `npm run typecheck`, `npm run lint`, `npm run build`, and the harness tool `verify-pong-game` (5/5).
- **Result (feature run):** all checks passed after two corrections (hook placement and the test mock result reset) recorded in the run log.
- **Post-run verification (final state):** the match-history migration was applied successfully to the approved project `jbkneqrbjuquvpxrufzu`. All four new columns (`opponent`, `opponent_score`, `mode`, `created_at`) were verified present; the remote migration history matches the local migrations (`20261114162000` and `20261114180000`); `verify-supabase-backend` passed all 10/10 checks, including cleanup. The latest suite has 11 test files and 73 tests passing.

This provides the evidence for M2 Requirement 4: a feature of the target software was implemented and the verification signal passes, with the run recorded.
