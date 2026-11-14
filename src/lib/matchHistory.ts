import { WINNING_SCORE } from '../game/pong';
import type { MatchRecord } from '../types';

export interface GameHistoryRow {
  id: string;
  username: string;
  score: number;
  opponent: string;
  opponent_score: number;
  mode: string;
  created_at: string;
}

const MATCH_MODES: MatchRecord['mode'][] = ['Ranked', 'Friendly', 'Tournament'];

function normalizeMode(value: string): MatchRecord['mode'] {
  return MATCH_MODES.find((mode) => mode === value) ?? 'Friendly';
}

export function toMatchRecord(row: GameHistoryRow): MatchRecord {
  return {
    id: row.id,
    opponent: row.opponent,
    result: row.score >= WINNING_SCORE ? 'win' : 'loss',
    playerScore: row.score,
    opponentScore: row.opponent_score,
    playedAt: row.created_at,
    mode: normalizeMode(row.mode),
  };
}
