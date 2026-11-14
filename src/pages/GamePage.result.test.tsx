import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginAsUser, navigateTo, renderApp } from '../test/testUtils';
import {
  createUsersQuery,
  supabaseMock,
  TEST_PROFILE,
} from '../test/supabaseMock';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

vi.mock('../game/pong', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../game/pong')>();

  return {
    ...actual,
    stepGame: vi.fn((state: Parameters<typeof actual.stepGame>[0]) => ({
      ...state,
      status: 'finished' as const,
      winner: 'human' as const,
      scores: { human: 5, ai: 2 },
      ball: { ...state.ball, vx: 0, vy: 0 },
    })),
  };
});

let frames = 0;

beforeEach(() => {
  frames = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    if (frames === 0) {
      frames = 1;
      callback(performance.now());
    }

    return frames;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('game result persistence', () => {
  it('saves a finished game once', async () => {
    renderApp();
    await loginAsUser();

    const gamesQuery = createUsersQuery();
    supabaseMock.from.mockReturnValue(gamesQuery);
    navigateTo('Play');
    fireEvent.click(screen.getByRole('button', { name: 'Start match' }));

    expect(await screen.findByText('Result saved.')).toBeInTheDocument();
    expect(gamesQuery.insert).toHaveBeenCalledWith({
      username: TEST_PROFILE.username,
      score: 5,
      opponent: 'SmashKing',
      opponent_score: 2,
      mode: 'Friendly',
    });
    expect(gamesQuery.insert).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the result cannot be saved', async () => {
    renderApp();
    await loginAsUser();

    const gamesQuery = createUsersQuery({
      insert: { data: null, error: { message: 'insert failed' } },
    });
    supabaseMock.from.mockReturnValue(gamesQuery);
    navigateTo('Play');
    fireEvent.click(screen.getByRole('button', { name: 'Start match' }));

    expect(
      await screen.findByText('Result could not be saved.'),
    ).toBeInTheDocument();
    expect(gamesQuery.insert).toHaveBeenCalledTimes(1);
  });
});
