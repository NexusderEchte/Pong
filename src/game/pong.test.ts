import { describe, expect, it } from 'vitest';
import {
  BALL_RADIUS,
  BASE_BALL_SPEED,
  COURT_HEIGHT,
  COURT_WIDTH,
  PADDLE_HEIGHT,
  WINNING_SCORE,
  createInitialState,
  moveAiPaddle,
  pauseGame,
  predictBallY,
  startGame,
  stepGame,
  type GameState,
} from './pong';

const idleInput = { up: false, down: false };

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    status: 'playing',
    ball: {
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: BASE_BALL_SPEED,
      vy: 0,
    },
    ...overrides,
  };
}

describe('pong game engine', () => {
  it('creates a ready state with centred paddles, ball and level scores', () => {
    const state = createInitialState();

    expect(state.status).toBe('ready');
    expect(state.scores).toEqual({ human: 0, ai: 0 });
    expect(state.winner).toBeNull();
    expect(state.ball).toMatchObject({
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: 0,
      vy: 0,
    });
    expect(state.humanY).toBe(COURT_HEIGHT / 2);
    expect(state.aiY).toBe(COURT_HEIGHT / 2);
  });

  it('serves the ball when the game starts and resumes without serving again', () => {
    const started = startGame(createInitialState());

    expect(started.status).toBe('playing');
    expect(started.ball.vx).toBeGreaterThan(0);
    expect(Math.abs(started.ball.vy)).toBeGreaterThan(0);

    const paused = pauseGame(started);
    const resumed = startGame(paused);

    expect(paused.status).toBe('paused');
    expect(resumed.status).toBe('playing');
    expect(resumed.ball).toEqual(started.ball);
  });

  it('moves the ball according to its velocity', () => {
    const state = playingState({
      ball: {
        x: 30,
        y: 30,
        vx: 60,
        vy: 12,
      },
    });

    const next = stepGame(state, 1 / 60, idleInput);

    expect(next.ball.x).toBeCloseTo(31, 5);
    expect(next.ball.y).toBeCloseTo(30.2, 5);
  });

  it('bounces the ball off the top and bottom walls', () => {
    const top = playingState({
      ball: { x: 50, y: BALL_RADIUS, vx: 20, vy: -40 },
    });
    const bottom = playingState({
      ball: { x: 50, y: COURT_HEIGHT - BALL_RADIUS, vx: 20, vy: 40 },
    });

    const afterTop = stepGame(top, 1 / 60, idleInput);
    const afterBottom = stepGame(bottom, 1 / 60, idleInput);

    expect(afterTop.ball.y).toBeGreaterThanOrEqual(BALL_RADIUS);
    expect(afterTop.ball.vy).toBeGreaterThan(0);
    expect(afterBottom.ball.y).toBeLessThanOrEqual(COURT_HEIGHT - BALL_RADIUS);
    expect(afterBottom.ball.vy).toBeLessThan(0);
  });

  it('moves the human paddle with the keyboard input and clamps it', () => {
    const state = playingState({ humanY: 30 });
    const up = stepGame(state, 1 / 30, { up: true, down: false });
    const down = stepGame(state, 1 / 30, { up: false, down: true });
    const held = stepGame(state, 1 / 30, { up: true, down: true });
    const clamped = stepGame(playingState({ humanY: 2 }), 1 / 10, {
      up: true,
      down: false,
    });

    expect(up.humanY).toBeLessThan(30);
    expect(down.humanY).toBeGreaterThan(30);
    expect(held.humanY).toBe(30);
    expect(clamped.humanY).toBeGreaterThanOrEqual(PADDLE_HEIGHT / 2);
  });

  it('bounces the ball off the human and AI paddles', () => {
    const humanHit = playingState({
      humanY: 30,
      ball: { x: 8.4, y: 30, vx: -52, vy: 0 },
    });
    const aiHit = playingState({
      aiY: 30,
      ball: { x: 91.5, y: 30, vx: 52, vy: 0 },
    });

    const afterHumanHit = stepGame(humanHit, 1 / 60, idleInput);
    const afterAiHit = stepGame(aiHit, 1 / 60, idleInput);

    expect(afterHumanHit.ball.vx).toBeGreaterThan(0);
    expect(afterHumanHit.ball.x).toBeGreaterThan(8);
    expect(afterAiHit.ball.vx).toBeLessThan(0);
    expect(afterAiHit.ball.x).toBeLessThan(92);
  });

  it('does not bounce when the ball misses the paddle', () => {
    const state = playingState({
      humanY: 30,
      ball: { x: 8.4, y: 5, vx: -52, vy: 0 },
    });

    const next = stepGame(state, 1 / 60, idleInput);

    expect(next.ball.vx).toBe(-52);
    expect(next.scores).toEqual({ human: 0, ai: 0 });
  });

  it('awards a point when the ball passes a paddle and serves to the loser', () => {
    const aiScores = stepGame(
      playingState({
        ball: { x: -2, y: 30, vx: -20, vy: 0 },
      }),
      1 / 60,
      idleInput,
    );

    expect(aiScores.scores).toEqual({ human: 0, ai: 1 });
    expect(aiScores.ball.x).toBe(COURT_WIDTH / 2);
    expect(aiScores.ball.vx).toBeLessThan(0);

    const humanScores = stepGame(
      playingState({
        ball: { x: COURT_WIDTH + 2, y: 30, vx: 20, vy: 0 },
      }),
      1 / 60,
      idleInput,
    );

    expect(humanScores.scores).toEqual({ human: 1, ai: 0 });
    expect(humanScores.ball.vx).toBeGreaterThan(0);
  });

  it('finishes the match when a player reaches the winning score', () => {
    const state = playingState({
      scores: { human: WINNING_SCORE - 1, ai: 2 },
      ball: { x: COURT_WIDTH + 2, y: 30, vx: 20, vy: 0 },
    });

    const next = stepGame(state, 1 / 60, idleInput);

    expect(next.scores.human).toBe(WINNING_SCORE);
    expect(next.status).toBe('finished');
    expect(next.winner).toBe('human');
    expect(next.ball.vx).toBe(0);
    expect(next.ball.vy).toBe(0);
  });

  it('predicts wall bounces and moves the AI paddle towards the ball', () => {
    const above = predictBallY({
      x: 50,
      y: 10,
      vx: 52,
      vy: 0,
    });
    const wallBounce = predictBallY({
      x: 50,
      y: 55,
      vx: 50,
      vy: 60,
    });
    const state = playingState({
      aiY: 30,
      ball: { x: 50, y: 10, vx: 52, vy: 0 },
    });

    const next = stepGame(state, 1 / 60, idleInput);
    const low = moveAiPaddle(30, { x: 50, y: 50, vx: 52, vy: 0 }, 1 / 30);

    expect(above).toBe(10);
    expect(wallBounce).toBeGreaterThanOrEqual(BALL_RADIUS);
    expect(wallBounce).toBeLessThanOrEqual(COURT_HEIGHT - BALL_RADIUS);
    expect(next.aiY).toBeLessThan(30);
    expect(low).toBeGreaterThan(30);
  });

  it('does not advance a paused match', () => {
    const paused = pauseGame(
      playingState({
        ball: { x: 40, y: 30, vx: 60, vy: 0 },
      }),
    );

    const next = stepGame(paused, 1 / 60, { up: true, down: false });

    expect(next).toBe(paused);
    expect(next.ball.x).toBe(40);
    expect(next.humanY).toBe(paused.humanY);
  });
});
