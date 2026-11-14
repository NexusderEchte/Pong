import { buildLeaderboard } from '../lib/leaderboard';
import { toMatchRecord, type GameHistoryRow } from '../lib/matchHistory';
import { derivePlayerStats, type PlayerStatRow } from '../lib/playerStats';
import { supabase } from '../lib/supabase';
import type { MatchRecord, PlayerStats } from '../types';

export async function fetchMatchHistory(
  username: string,
): Promise<MatchRecord[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, username, score, opponent, opponent_score, mode, created_at')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as GameHistoryRow[] | null) ?? []).map(toMatchRecord);
}

export async function fetchPlayerStats(username: string): Promise<PlayerStats> {
  const { data, error } = await supabase
    .from('games')
    .select('username, score, opponent_score, mode, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data as PlayerStatRow[] | null) ?? [];
  const rank =
    buildLeaderboard(rows, username).findIndex(
      (entry) => entry.username === username,
    ) + 1;
  const playerRows = rows.filter((row) => row.username === username);

  return derivePlayerStats(playerRows, rank);
}
