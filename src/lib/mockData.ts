export interface GameStat {
  label: string;
  value: string | number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  points: number;
}

export interface MatchHistory {
  id: string;
  opponent: string;
  result: 'win' | 'loss';
  score: string;
  date: string;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'Nova', wins: 42, losses: 8, points: 1420 },
  { rank: 2, username: 'Ace', wins: 38, losses: 12, points: 1290 },
  { rank: 3, username: 'Zephyr', wins: 35, losses: 15, points: 1180 },
  { rank: 4, username: 'Rift', wins: 30, losses: 20, points: 1040 },
  { rank: 5, username: 'Koda', wins: 27, losses: 23, points: 960 },
  { rank: 6, username: 'Juno', wins: 24, losses: 26, points: 890 },
  { rank: 7, username: 'Vex', wins: 20, losses: 30, points: 810 },
  { rank: 8, username: 'Lyra', wins: 18, losses: 32, points: 770 },
  { rank: 9, username: 'Onyx', wins: 15, losses: 35, points: 710 },
  { rank: 10, username: 'Sora', wins: 12, losses: 38, points: 650 },
];

export const MOCK_STATS: GameStat[] = [
  { label: 'Spiele gesamt', value: 84 },
  { label: 'Siege', value: 48 },
  { label: 'Niederlagen', value: 36 },
  { label: 'Beste Punktzahl', value: 1240 },
  { label: 'Winrate', value: '57.1%' },
  { label: 'Aktuelle Serie', value: '3 Siege' },
];

export const MOCK_HISTORY: MatchHistory[] = [
  {
    id: 'm1',
    opponent: 'Nova',
    result: 'loss',
    score: '7:11',
    date: 'Heute, 14:32',
  },
  {
    id: 'm2',
    opponent: 'Ace',
    result: 'win',
    score: '11:9',
    date: 'Gestern, 20:10',
  },
  {
    id: 'm3',
    opponent: 'Zephyr',
    result: 'win',
    score: '11:6',
    date: 'Gestern, 18:45',
  },
  {
    id: 'm4',
    opponent: 'Rift',
    result: 'loss',
    score: '9:11',
    date: 'Di, 16:20',
  },
  {
    id: 'm5',
    opponent: 'Koda',
    result: 'win',
    score: '11:7',
    date: 'Mo, 21:05',
  },
  {
    id: 'm6',
    opponent: 'Juno',
    result: 'loss',
    score: '8:11',
    date: 'So, 15:30',
  },
];

export const DELAY = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateAsync<T>(data: T): Promise<T> {
  await delay(DELAY);
  return data;
}
