import { WINNING_SCORE } from '../game/pong';
import type { LeaderboardPlayer } from '../types';

export interface GameRow {
  username: string;
  score: number;
}

export function buildLeaderboard(
  rows: GameRow[],
  currentUsername: string,
): LeaderboardPlayer[] {
  const totals = new Map<
    string,
    { wins: number; losses: number; points: number }
  >();

  rows.forEach((row) => {
    const entry = totals.get(row.username) ?? {
      wins: 0,
      losses: 0,
      points: 0,
    };

    if (row.score >= WINNING_SCORE) {
      entry.wins += 1;
    } else {
      entry.losses += 1;
    }

    entry.points += row.score;
    totals.set(row.username, entry);
  });

  return Array.from(totals.entries())
    .map(([username, entry]) => ({
      id: username,
      username,
      wins: entry.wins,
      losses: entry.losses,
      points: entry.points,
      isCurrentUser: username === currentUsername,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        a.username.localeCompare(b.username),
    );
}
