import { act, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  loginAsUser,
  mockLeaderboardResult,
  navigateTo,
  renderApp,
} from '../test/testUtils';
import type { QueryResult } from '../test/supabaseMock';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

const games = [
  { username: 'SmashKing', score: 5 },
  { username: 'SmashKing', score: 3 },
  { username: 'SpinMaster', score: 5 },
  { username: 'PaddlePro', score: 4 },
  { username: 'TestPlayer', score: 2 },
];

function deferredResult() {
  let resolve!: (value: QueryResult) => void;
  const promise = new Promise<QueryResult>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

describe('leaderboard page', () => {
  it('shows the global table and highlights the top three players', async () => {
    renderApp();
    await loginAsUser();
    mockLeaderboardResult({ data: games, error: null });
    navigateTo('Leaderboard');

    expect(
      await screen.findByRole('heading', { name: 'Leaderboard' }),
    ).toBeInTheDocument();

    const table = await screen.findByRole('table', {
      name: 'Global leaderboard',
    });
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(5);

    ['SmashKing', 'SpinMaster', 'PaddlePro'].forEach((player) => {
      expect(
        within(table).getByRole('row', { name: new RegExp(player) }),
      ).toHaveClass('is-top-three');
    });
  });

  it('marks the signed-in player in the standings', async () => {
    renderApp();
    await loginAsUser();
    mockLeaderboardResult({ data: games, error: null });
    navigateTo('Leaderboard');

    const table = await screen.findByRole('table', {
      name: 'Global leaderboard',
    });
    const currentUserRow = within(table).getByRole('row', {
      name: /TestPlayer/,
    });

    expect(currentUserRow).toHaveClass('is-current-user');
    expect(within(currentUserRow).getByText('You')).toBeInTheDocument();
  });

  it('shows a loading state while games are fetched', async () => {
    renderApp();
    await loginAsUser();
    const deferred = deferredResult();
    mockLeaderboardResult(deferred.promise);
    navigateTo('Leaderboard');

    expect(screen.getByRole('status')).toHaveTextContent(
      /loading leaderboard/i,
    );

    await act(async () => {
      deferred.resolve({ data: games, error: null });
    });

    expect(
      await screen.findByRole('table', { name: 'Global leaderboard' }),
    ).toBeInTheDocument();
  });

  it('shows an empty state when no games exist', async () => {
    renderApp();
    await loginAsUser();
    mockLeaderboardResult({ data: [], error: null });
    navigateTo('Leaderboard');

    expect(await screen.findByText('No games played yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error state when games cannot be loaded', async () => {
    renderApp();
    await loginAsUser();
    mockLeaderboardResult({
      data: null,
      error: { message: 'network error' },
    });
    navigateTo('Leaderboard');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not be loaded/i,
    );
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
