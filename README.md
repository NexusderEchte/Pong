# Ping Pong

A browser-based Ping Pong web application for a university project. This repository contains a playable match against an AI opponent alongside a player dashboard, player profiles, and a global leaderboard.

Authentication is handled by Supabase Auth, and each account has a profile row in `public.users`. Finished game results are stored in `public.games`, and the global leaderboard is loaded from that table. Match history and detailed player statistics still use mock data until the remaining persistence work is implemented. See `M2_DEFINITION_OF_DONE.md` for the agreed acceptance criteria.

## Tech Stack

- React 19
- TypeScript
- Vite
- HTML and CSS
- Supabase Auth
- Supabase PostgreSQL
- Vitest with React Testing Library
- Playwright
- ESLint and Prettier

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project used for development/testing (no local Supabase instance)

## Installation

```bash
npm install
```

Create a local `.env.local` (gitignored) with the Supabase project values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Only the publishable key belongs in the browser bundle. Never expose a secret or service-role key through a `VITE_*` variable.

Optional: install the Playwright browser used by the end-to-end tests.

```bash
npx playwright install chromium
```

## Development

Start the Vite development server:

```bash
npm run dev
```

The application is available at http://localhost:5173.

### Accounts

Create an account from the registration screen. Authentication, sessions and logout are managed by Supabase Auth against the configured development/test project.

If email confirmation is enabled in Supabase, confirm your email before signing in. Passwords are managed by Supabase Auth and are never stored in application tables.

### Game Controls

- Move your paddle up: `W` or `Arrow Up`
- Move your paddle down: `S` or `Arrow Down`
- Use the on-screen buttons to start, pause, resume, or restart the match.

## Available Scripts

| Script                 | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the development server                 |
| `npm run build`        | Type-check and create a production build     |
| `npm run preview`      | Preview the production build locally         |
| `npm run typecheck`    | Run the TypeScript compiler without emitting |
| `npm run lint`         | Run ESLint                                   |
| `npm run lint:fix`     | Run ESLint and fix issues where possible     |
| `npm run format`       | Format all files with Prettier               |
| `npm run format:check` | Check formatting without changing files      |
| `npm test`             | Run unit tests once with Vitest              |
| `npm run test:watch`   | Run unit tests in watch mode                 |
| `npm run test:e2e`     | Run Playwright end-to-end tests              |
| `npm run test:e2e:ui`  | Run Playwright tests in interactive UI mode  |

## Project Structure

```text
.
├── e2e/                    # Playwright end-to-end tests
├── public/                 # Static assets served as-is
├── src/
│   ├── components/         # Reusable UI components and app shell
│   ├── context/            # Authentication provider and context
│   ├── data/               # Data access; mock fixtures during the prototype
│   ├── lib/                # Routing, validation and formatting helpers
│   ├── pages/              # Route-level page components
│   ├── test/               # Test setup and shared test utilities
│   ├── App.test.tsx        # Authentication and routing tests
│   ├── App.tsx             # Root application component
│   ├── index.css           # Global styles and design tokens
│   └── main.tsx            # Application entry point
├── supabase/               # Supabase migrations and configuration (M2)
├── index.html              # Vite HTML entry point
├── eslint.config.js        # ESLint configuration
├── playwright.config.ts    # Playwright configuration
├── vite.config.ts          # Vite and Vitest configuration
└── tsconfig*.json          # TypeScript configuration
```

The application uses a small hash-based router instead of an additional routing dependency. Until the M2 implementation is complete, authentication, match, and leaderboard data are mocked in `src/data`.

## Testing

Unit and component tests use Vitest, jsdom, and React Testing Library. Test files live next to the code they test and use the `*.test.ts` or `*.test.tsx` suffix. Supabase is mocked in these tests.

End-to-end tests use Playwright and live in the `e2e/` directory. Playwright starts the Vite development server automatically. The game end-to-end test needs an existing Supabase account:

```bash
E2E_SUPABASE_EMAIL=... E2E_SUPABASE_PASSWORD=... npm run test:e2e
```

The test is skipped when those variables are not set.

The M2 verification loop adds database and RLS checks through a Supabase verification tool. These checks must run only against the dedicated development/test project, never production.

## Dependencies

### Runtime

- `react` — UI library used to build the application.
- `react-dom` — Renders React components into the browser DOM.
- `@supabase/supabase-js` — Supabase Auth and PostgreSQL client (added with the M2 integration).

### Development

- `vite` — Development server and production build tool.
- `@vitejs/plugin-react` — React support, including Fast Refresh, for Vite.
- `typescript` — Type-safe JavaScript compiler.
- `@types/react`, `@types/react-dom` — TypeScript definitions for React.
- `@types/node` — TypeScript definitions for Node.js APIs used by config files.
- `eslint` — Static analysis and code quality checks.
- `@eslint/js` — ESLint's recommended JavaScript rules.
- `typescript-eslint` — TypeScript parser and rules for ESLint.
- `eslint-plugin-react-hooks` — Enforces React Hooks rules.
- `eslint-plugin-react-refresh` — Enforces Vite's Fast Refresh constraints.
- `eslint-config-prettier` — Disables ESLint rules that conflict with Prettier.
- `globals` — Browser and Node.js global definitions for ESLint.
- `prettier` — Consistent code formatting.
- `vitest` — Unit test runner integrated with Vite.
- `jsdom` — Browser-like DOM environment for unit tests.
- `@testing-library/react` — Renders and queries React components in tests.
- `@testing-library/jest-dom` — Adds DOM-specific test matchers.
- `@playwright/test` — End-to-end browser testing framework.

## Scope

The current UI prototype includes:

- Login, registration and logout with client-side validation and Supabase Auth
- Persistent sessions restored after a page refresh, with auth state change handling
- A `public.users` profile created after registration, protected by RLS
- Dashboard with match statistics, recent results, and personal bests
- Playable single-player match against an AI opponent with ball physics, keyboard paddle controls, automatic scoring, a first-to-five winning condition, and pause/restart controls
- Finished match results saved once to `public.games`
- Player profile with career statistics and a match history view
- Supabase-backed global leaderboard with loading, empty and error states
- Leaderboard ranking derived from stored game scores, with the top three and signed-in player highlighted
- Responsive layouts and reusable React components

Remaining M2 work:

- Supabase PostgreSQL persistence for the full match history and player statistics

It intentionally does not include:

- A custom backend server or a service-role key in the browser
- Anti-cheat or match-integrity enforcement (accepted project limitation)
- Additional UI frameworks or state management libraries
