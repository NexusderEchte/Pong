export interface PlayerStats {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  rank: number;
  bestStreak: number;
  bestScore: string;
  tournamentsWon: number;
  averagePoints: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  location: string;
  joinedAt: string;
  accent: string;
  stats: PlayerStats;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  result: 'win' | 'loss';
  playerScore: number;
  opponentScore: number;
  playedAt: string;
  mode: 'Ranked' | 'Friendly' | 'Tournament';
}

export interface LeaderboardPlayer {
  id: string;
  username: string;
  wins: number;
  losses: number;
  points: number;
  isCurrentUser: boolean;
}
