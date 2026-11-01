export type AppRoute =
  'login' | 'register' | 'dashboard' | 'game' | 'profile' | 'leaderboard';

export interface AuthUser {
  username: string;
  email: string;
  displayName: string;
}

export type MatchResult = 'win' | 'loss';

export interface MatchRecord {
  id: string;
  opponent: string;
  result: MatchResult;
  playerScore: number;
  opponentScore: number;
  playedAt: string;
  points: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  bestStreak: number;
  bestScore: string;
  rank: number;
}

export interface PlayerProfile {
  username: string;
  displayName: string;
  bio: string;
  country: string;
  joinedAt: string;
  stats: PlayerStats;
  matches: MatchRecord[];
}

export interface LeaderboardPlayer {
  id: string;
  username: string;
  country: string;
  wins: number;
  losses: number;
  points: number;
  streak: number;
}
