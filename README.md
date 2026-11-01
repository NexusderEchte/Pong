# Ping Pong

A browser-based Ping Pong web application for a university project. This repository contains a playable match against an AI opponent alongside mock authentication, a player dashboard, player profiles, and a global leaderboard. Account, profile, and leaderboard data are local mock data; there is no backend or database integration.

## Tech Stack

- React 19
- TypeScript
- Vite
- HTML and CSS
- Vitest with React Testing Library
- Playwright
- ESLint and Prettier

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Installation

```bash
npm install
```

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

### Demo Access

Use the demo account or the "Use demo account" shortcut on the login screen:

- Email: `demo@pingpong.app`
- Password: `pong1234`

New accounts created through the registration form are kept in memory for the current session. The signed-in user is stored in `localStorage` so a page reload keeps the session.

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
│   ├── context/            # Mock authentication provider and context
│   ├── data/               # Mock players, matches and leaderboard data
│   ├── lib/                # Routing, validation and formatting helpers
│   ├── pages/              # Route-level page components
│   ├── test/               # Test setup and shared test utilities
│   ├── App.test.tsx        # Authentication and routing tests
│   ├── App.tsx             # Root application component
│   ├── index.css           # Global styles and design tokens
│   └── main.tsx            # Application entry point
├── index.html              # Vite HTML entry point
├── eslint.config.js        # ESLint configuration
├── playwright.config.ts    # Playwright configuration
├── vite.config.ts          # Vite and Vitest configuration
└── tsconfig*.json          # TypeScript configuration
```

The application uses a small hash-based router instead of an additional routing dependency. Authentication, match, and leaderboard data are mocked in `src/data`.

## Testing

Unit and component tests use Vitest, jsdom, and React Testing Library. Test files live next to the code they test and use the `*.test.ts` or `*.test.tsx` suffix.

End-to-end tests use Playwright and live in the `e2e/` directory. Playwright starts the Vite development server automatically.

## Dependencies

### Runtime

- `react` — UI library used to build the application.
- `react-dom` — Renders React components into the browser DOM.

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

This UI prototype includes:

- Login and registration with client-side validation and mock authentication
- Dashboard with match statistics, recent results, and personal bests
- Playable single-player match against an AI opponent with ball physics, keyboard paddle controls, automatic scoring, a first-to-five winning condition, and pause/restart controls
- Player profile with career statistics and mock match history
- Global leaderboard with a highlighted top three and the signed-in player
- Responsive layouts and reusable React components

It intentionally does not include:

- Real authentication, a backend, or database integration
- Supabase integration
- Full ping pong game physics or automated gameplay
- Additional UI frameworks or state management libraries
