import { describe, expect, it } from 'vitest';
import { buildLeaderboard } from './leaderboard';

describe('buildLeaderboard', () => {
  it('aggregates games per username and marks the current player', () => {
    const entries = buildLeaderboard(
      [
        { username: 'SmashKing', score: 5 },
        { username: 'SmashKing', score: 3 },
        { username: 'SpinMaster', score: 5 },
        { username: 'TestPlayer', score: 4 },
      ],
      'TestPlayer',
    );

    expect(entries).toEqual([
      {
        id: 'SmashKing',
        username: 'SmashKing',
        wins: 1,
        losses: 1,
        points: 8,
        isCurrentUser: false,
      },
      {
        id: 'SpinMaster',
        username: 'SpinMaster',
        wins: 1,
        losses: 0,
        points: 5,
        isCurrentUser: false,
      },
      {
        id: 'TestPlayer',
        username: 'TestPlayer',
        wins: 0,
        losses: 1,
        points: 4,
        isCurrentUser: true,
      },
    ]);
  });

  it('breaks ties by wins and then username', () => {
    const entries = buildLeaderboard(
      [
        { username: 'Zed', score: 5 },
        { username: 'Amy', score: 5 },
        { username: 'Bob', score: 4 },
      ],
      'Zed',
    );

    expect(entries.map((entry) => entry.username)).toEqual([
      'Amy',
      'Zed',
      'Bob',
    ]);
  });

  it('returns an empty list when there are no games', () => {
    expect(buildLeaderboard([], 'TestPlayer')).toEqual([]);
  });
});
