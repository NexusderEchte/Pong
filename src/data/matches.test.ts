import { describe, expect, it, vi } from 'vitest';
import { createUsersQuery, supabaseMock } from '../test/supabaseMock';
import { fetchPlayerStats } from './matches';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

const games = [
  {
    username: 'Other',
    score: 5,
    opponent_score: 1,
    mode: 'Friendly',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    username: 'Other',
    score: 5,
    opponent_score: 2,
    mode: 'Friendly',
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    username: 'TestPlayer',
    score: 5,
    opponent_score: 2,
    mode: 'Friendly',
    created_at: '2026-01-03T00:00:00.000Z',
  },
  {
    username: 'TestPlayer',
    score: 3,
    opponent_score: 5,
    mode: 'Friendly',
    created_at: '2026-01-04T00:00:00.000Z',
  },
];

describe('fetchPlayerStats', () => {
  it('derives stats and the global rank from stored games', async () => {
    supabaseMock.from.mockReturnValue(
      createUsersQuery({ list: { data: games, error: null } }),
    );

    const stats = await fetchPlayerStats('TestPlayer');

    expect(stats).toEqual({
      matches: 2,
      wins: 1,
      losses: 1,
      winRate: 50,
      points: 8,
      rank: 2,
      bestStreak: 1,
      bestScore: '5 – 2',
      tournamentsWon: 0,
      averagePoints: 4,
    });
  });

  it('returns zeroed stats and rank 0 when the player has no matches', async () => {
    supabaseMock.from.mockReturnValue(
      createUsersQuery({ list: { data: [], error: null } }),
    );

    const stats = await fetchPlayerStats('TestPlayer');

    expect(stats).toEqual({
      matches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      points: 0,
      rank: 0,
      bestStreak: 0,
      bestScore: '—',
      tournamentsWon: 0,
      averagePoints: 0,
    });
  });
});
