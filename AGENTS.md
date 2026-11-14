# Agent Instructions – Ping Pong

## Project Overview

This repository contains a browser-based Ping Pong game.

The goal is to develop a playable game with user authentication,
persistent player profiles, high scores and a global leaderboard.

## Technology Stack

- React
- TypeScript
- Vite
- HTML and CSS
- Supabase Authentication
- Supabase PostgreSQL
- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

## Development Rules

1. Use TypeScript for application code.
2. Follow the existing project structure and coding conventions.
3. Keep components small and maintainable.
4. Write tests for new functionality.
5. Run relevant tests after making changes.
6. Run ESLint and TypeScript checks before completing a task.
7. Do not introduce unnecessary dependencies.
8. Never expose API keys, credentials or secrets.
9. Do not modify unrelated files.
10. Explain important implementation decisions.

## Git Rules

- Work on the current branch.
- Do not commit or push changes unless explicitly requested.
- Do not overwrite existing work.
- The agent may use read-only Git commands such as `git status`, `git log`, `git diff`, `git branch`, and `git show`.
- The agent must NEVER execute commands that modify Git state.
- Forbidden commands include `git add`, `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git reset`, `git checkout`, `git switch`, `git stash`, and `git cherry-pick`.
- Never create commits, stage files, change branches, or modify the Git index.
- All Git operations that modify repository state must be performed manually by the user.

## Sandbox and Permissions

- OpenCode permission rules are configured in `opencode.json` using the V1 `permission` syntax supported by OpenCode 1.18.31.
- This configuration is an application-level guardrail, not an OS-level sandbox.
- Pre-approved verification commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run format:check`, `npm run test:e2e`, and the custom tools `check-project`, `run-pong-checks`, `verify-pong-game`, and `verify-supabase-backend`.
- Read-only Git inspection is allowed. All Git writes are denied.
- Do not read, edit, copy, or print `.env*` files. `.env.example` is allowed. Never expose secrets.
- Supabase verification may target only the approved project `jbkneqrbjuquvpxrufzu` (see `harness.config.json`). Never use a service-role or secret key.
- `grep`, package installs, external paths, web access, and subagents require confirmation.
- Remote Supabase migrations, package publishing, and destructive filesystem commands are denied.
- See `HARNESS_README.md` section 12 for the full permission matrix.

## Stop Criterion

- The `build` agent uses OpenCode's native step limit: `agent.build.maxSteps = 30` in `opencode.json`.
- This is a model-step budget, not a custom verification-retry counter. It bounds runaway execution while allowing normal implementation and verification.
- On the final allowed step, OpenCode removes tools and asks for a text-only summary; the run cannot make further tool calls.
- If work cannot finish within the limit, stop and report the incomplete work instead of bypassing the limit.
- The M2 demonstration must show the limit taking effect. Until that run is recorded, enforcement is configured but not demonstrated.

## Working Approach

- Inspect the existing code before making changes.
- Prefer small, incremental changes.
- Explain what you intend to change before implementing complex features.
- Report which tests and checks were executed.
