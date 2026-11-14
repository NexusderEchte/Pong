import { describe, expect, it } from 'vitest';
import { toMatchRecord, type GameHistoryRow } from './matchHistory';

const baseRow: GameHistoryRow = {
  id: 'game-1',
  username: 'TestPlayer',
  score: 5,
  opponent: 'SmashKing',
  opponent_score: 2,
  mode: 'Friendly',
  created_at: '2026-11-14T12:00:00.000Z',
};

describe('toMatchRecord', () => {
  it('maps a winning game to a match record', () => {
    expect(toMatchRecord(baseRow)).toEqual({
      id: 'game-1',
      opponent: 'SmashKing',
      result: 'win',
      playerScore: 5,
      opponentScore: 2,
      playedAt: '2026-11-14T12:00:00.000Z',
      mode: 'Friendly',
    });
  });

  it('maps a losing game and preserves a known mode', () => {
    expect(
      toMatchRecord({
        ...baseRow,
        id: 'game-2',
        score: 3,
        opponent_score: 5,
        mode: 'Ranked',
      }),
    ).toMatchObject({ result: 'loss', mode: 'Ranked' });
  });

  it('falls back to Friendly for an unknown mode', () => {
    expect(toMatchRecord({ ...baseRow, mode: 'Solo' }).mode).toBe('Friendly');
  });
});
