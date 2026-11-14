import { WINNING_SCORE } from '../game/pong';
import type { PlayerStats } from '../types';
import type { GameRow } from './leaderboard';

export interface PlayerStatRow extends GameRow {
  opponent_score: number;
  mode: string;
  created_at: string;
}

function isWin(row: PlayerStatRow): boolean {
  return row.score >= WINNING_SCORE;
}

export function derivePlayerStats(
  rows: PlayerStatRow[],
  rank: number,
): PlayerStats {
  const matches = rows.length;

  if (matches === 0) {
    return {
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
    };
  }

  const wins = rows.filter(isWin).length;
  const losses = matches - wins;
  const points = rows.reduce((total, row) => total + row.score, 0);
  const winRate = Math.round((wins / matches) * 100);
  const averagePoints = Math.round((points / matches) * 10) / 10;
  const tournamentsWon = rows.filter(
    (row) => row.mode === 'Tournament' && isWin(row),
  ).length;

  const bestWin = rows
    .filter(isWin)
    .reduce<PlayerStatRow | null>((best, row) => {
      if (!best) {
        return row;
      }

      const margin = row.score - row.opponent_score;
      const bestMargin = best.score - best.opponent_score;

      if (margin > bestMargin) {
        return row;
      }

      if (margin === bestMargin && row.score > best.score) {
        return row;
      }

      return best;
    }, null);

  let currentStreak = 0;
  let bestStreak = 0;

  for (const row of rows) {
    if (isWin(row)) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    matches,
    wins,
    losses,
    winRate,
    points,
    rank,
    bestStreak,
    bestScore: bestWin ? `${bestWin.score} – ${bestWin.opponent_score}` : '—',
    tournamentsWon,
    averagePoints,
  };
}
