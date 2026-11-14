import { describe, expect, it } from 'vitest';
import { derivePlayerStats, type PlayerStatRow } from './playerStats';

function makeRow(
  score: number,
  opponentScore: number,
  mode = 'Friendly',
): PlayerStatRow {
  return {
    username: 'TestPlayer',
    score,
    opponent_score: opponentScore,
    mode,
    created_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('derivePlayerStats', () => {
  it('returns zeroed statistics and rank 0 for a player with no matches', () => {
    expect(derivePlayerStats([], 0)).toEqual({
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

  it('calculates matches, results, points, best score and streak', () => {
    const rows = [
      makeRow(5, 2),
      makeRow(3, 5),
      makeRow(5, 4, 'Tournament'),
      makeRow(5, 0, 'Tournament'),
    ];

    expect(derivePlayerStats(rows, 4)).toEqual({
      matches: 4,
      wins: 3,
      losses: 1,
      winRate: 75,
      points: 18,
      rank: 4,
      bestStreak: 2,
      bestScore: '5 – 0',
      tournamentsWon: 2,
      averagePoints: 4.5,
    });
  });

  it('handles a player with only losses', () => {
    const rows = [makeRow(2, 5), makeRow(4, 5)];

    expect(derivePlayerStats(rows, 3)).toEqual({
      matches: 2,
      wins: 0,
      losses: 2,
      winRate: 0,
      points: 6,
      rank: 3,
      bestStreak: 0,
      bestScore: '—',
      tournamentsWon: 0,
      averagePoints: 3,
    });
  });

  it('rounds the win rate and average points', () => {
    const rows = [makeRow(5, 2), makeRow(5, 1), makeRow(3, 5)];

    expect(derivePlayerStats(rows, 2)).toMatchObject({
      matches: 3,
      wins: 2,
      losses: 1,
      winRate: 67,
      points: 13,
      averagePoints: 4.3,
      bestScore: '5 – 1',
      bestStreak: 2,
    });
  });
});
