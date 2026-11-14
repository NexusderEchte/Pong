import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  createUsersQuery,
  supabaseMock,
  TEST_PROFILE,
} from '../test/supabaseMock';
import { loginAsUser, navigateTo, renderApp } from '../test/testUtils';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

describe('profile page', () => {
  it('shows the signed-in player and an empty match history', async () => {
    renderApp();
    await loginAsUser();
    navigateTo('Profile');

    expect(
      screen.getByRole('heading', { name: 'Your player card' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'TestPlayer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('@TestPlayer')).toBeInTheDocument();
    expect(screen.getByText('testplayer@example.com')).toBeInTheDocument();
    expect(screen.getByText('Best match score')).toBeInTheDocument();
    expect(await screen.findByText('No matches recorded')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows match history loaded from Supabase', async () => {
    renderApp();
    await loginAsUser();

    supabaseMock.from.mockReturnValue(
      createUsersQuery({
        list: {
          data: [
            {
              id: 'game-1',
              username: TEST_PROFILE.username,
              score: 5,
              opponent: 'SmashKing',
              opponent_score: 2,
              mode: 'Friendly',
              created_at: '2026-11-14T12:00:00.000Z',
            },
            {
              id: 'game-2',
              username: TEST_PROFILE.username,
              score: 3,
              opponent: 'SmashKing',
              opponent_score: 5,
              mode: 'Friendly',
              created_at: '2026-11-13T12:00:00.000Z',
            },
          ],
          error: null,
        },
      }),
    );

    navigateTo('Profile');

    const table = await screen.findByRole('table');
    expect(within(table).getAllByText('SmashKing')).toHaveLength(2);
    expect(within(table).getByText('5 – 2')).toBeInTheDocument();
    expect(within(table).getByText('3 – 5')).toBeInTheDocument();
    expect(within(table).getByText('Win')).toBeInTheDocument();
    expect(within(table).getByText('Loss')).toBeInTheDocument();
  });
});
