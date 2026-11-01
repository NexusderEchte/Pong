export const COURT_WIDTH = 100;
export const COURT_HEIGHT = 60;
export const PADDLE_WIDTH = 2;
export const PADDLE_HEIGHT = 13;
export const PADDLE_X = 6;
export const BALL_RADIUS = 1.25;
export const HUMAN_SPEED = 56;
export const AI_SPEED = 43;
export const BASE_BALL_SPEED = 52;
export const MAX_BALL_SPEED = 88;
export const WINNING_SCORE = 5;

const MAX_BOUNCE_ANGLE = Math.PI / 3;
const BALL_SPEEDUP = 1.05;
const AI_DEAD_ZONE = 0.35;

const HUMAN_FACE = PADDLE_X + PADDLE_WIDTH / 2;
const AI_PADDLE_X = COURT_WIDTH - PADDLE_X;
const AI_FACE = AI_PADDLE_X - PADDLE_WIDTH / 2;
const CENTER_X = COURT_WIDTH / 2;
const CENTER_Y = COURT_HEIGHT / 2;

export type GameStatus = 'ready' | 'playing' | 'paused' | 'finished';
export type Side = 'human' | 'ai';

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Scores {
  human: number;
  ai: number;
}

export interface GameState {
  status: GameStatus;
  ball: Ball;
  humanY: number;
  aiY: number;
  scores: Scores;
  winner: Side | null;
}

export interface PaddleInput {
  up: boolean;
  down: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function paddleLimit(): { min: number; max: number } {
  return {
    min: PADDLE_HEIGHT / 2,
    max: COURT_HEIGHT - PADDLE_HEIGHT / 2,
  };
}

function serve(direction: 1 | -1): Ball {
  const angle = 0.18 + Math.random() * 0.24;
  const verticalDirection = Math.random() < 0.5 ? -1 : 1;

  return {
    x: CENTER_X,
    y: CENTER_Y,
    vx: Math.cos(angle) * BASE_BALL_SPEED * direction,
    vy: Math.sin(angle) * BASE_BALL_SPEED * verticalDirection,
  };
}

export function createInitialState(): GameState {
  return {
    status: 'ready',
    ball: {
      x: CENTER_X,
      y: CENTER_Y,
      vx: 0,
      vy: 0,
    },
    humanY: CENTER_Y,
    aiY: CENTER_Y,
    scores: { human: 0, ai: 0 },
    winner: null,
  };
}

export function startGame(state: GameState): GameState {
  if (state.status === 'playing' || state.status === 'finished') {
    return state;
  }

  if (state.status === 'paused') {
    return { ...state, status: 'playing' };
  }

  return {
    ...state,
    status: 'playing',
    ball: serve(1),
  };
}

export function pauseGame(state: GameState): GameState {
  return state.status === 'playing' ? { ...state, status: 'paused' } : state;
}

export function moveHumanPaddle(
  y: number,
  input: PaddleInput,
  deltaSeconds: number,
): number {
  const direction = Number(input.down) - Number(input.up);
  const limits = paddleLimit();

  return clamp(
    y + direction * HUMAN_SPEED * deltaSeconds,
    limits.min,
    limits.max,
  );
}

function foldIntoCourt(value: number): number {
  const min = BALL_RADIUS;
  const max = COURT_HEIGHT - BALL_RADIUS;
  const span = max - min;
  const period = span * 2;
  let folded = (value - min) % period;

  if (folded < 0) {
    folded += period;
  }

  if (folded > span) {
    folded = period - folded;
  }

  return min + folded;
}

export function predictBallY(ball: Ball): number {
  if (ball.vx <= 0) {
    return CENTER_Y;
  }

  const targetPlane = AI_FACE - BALL_RADIUS;
  const timeToReach = (targetPlane - ball.x) / ball.vx;

  if (timeToReach <= 0) {
    return ball.y;
  }

  return foldIntoCourt(ball.y + ball.vy * timeToReach);
}

export function moveAiPaddle(
  y: number,
  ball: Ball,
  deltaSeconds: number,
): number {
  const limits = paddleLimit();
  const target = predictBallY(ball);
  const difference = target - y;

  if (Math.abs(difference) <= AI_DEAD_ZONE) {
    return y;
  }

  const step = Math.min(Math.abs(difference), AI_SPEED * deltaSeconds);

  return clamp(y + Math.sign(difference) * step, limits.min, limits.max);
}

interface Collision {
  crossed: boolean;
  y: number;
}

function checkPaddleCrossing(
  previousX: number,
  previousY: number,
  ball: Ball,
  plane: number,
  edgeDirection: 1 | -1,
): Collision {
  const startEdge = previousX + edgeDirection * BALL_RADIUS;
  const endEdge = ball.x + edgeDirection * BALL_RADIUS;

  const crossed =
    edgeDirection === -1
      ? startEdge >= plane && endEdge <= plane
      : startEdge <= plane && endEdge >= plane;

  if (!crossed) {
    return { crossed: false, y: ball.y };
  }

  const span = endEdge - startEdge;
  const progress = span === 0 ? 0 : (plane - startEdge) / span;

  return {
    crossed: true,
    y: previousY + (ball.y - previousY) * progress,
  };
}

function bounceOffPaddle(ball: Ball, paddleY: number, direction: 1 | -1): void {
  const offset = clamp((ball.y - paddleY) / (PADDLE_HEIGHT / 2), -1, 1);
  const angle = offset * MAX_BOUNCE_ANGLE;
  const currentSpeed = Math.hypot(ball.vx, ball.vy);
  const speed = Math.min(
    Math.max(currentSpeed, BASE_BALL_SPEED) * BALL_SPEEDUP,
    MAX_BALL_SPEED,
  );

  ball.vx = Math.cos(angle) * speed * direction;
  ball.vy = Math.sin(angle) * speed;
}

function scorePoint(state: GameState, scorer: Side): GameState {
  const scores = {
    human: state.scores.human + (scorer === 'human' ? 1 : 0),
    ai: state.scores.ai + (scorer === 'ai' ? 1 : 0),
  };
  const winner =
    scores.human >= WINNING_SCORE
      ? 'human'
      : scores.ai >= WINNING_SCORE
        ? 'ai'
        : null;

  if (winner) {
    return {
      ...state,
      status: 'finished',
      scores,
      winner,
      ball: { x: CENTER_X, y: CENTER_Y, vx: 0, vy: 0 },
    };
  }

  return {
    ...state,
    scores,
    ball: serve(scorer === 'human' ? 1 : -1),
  };
}

export function stepGame(
  state: GameState,
  deltaSeconds: number,
  input: PaddleInput,
): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const delta = clamp(deltaSeconds, 0, 1 / 30);

  if (delta === 0) {
    return state;
  }

  const humanY = moveHumanPaddle(state.humanY, input, delta);
  const aiY = moveAiPaddle(state.aiY, state.ball, delta);
  const previousX = state.ball.x;
  const previousY = state.ball.y;
  const ball: Ball = {
    ...state.ball,
    x: state.ball.x + state.ball.vx * delta,
    y: state.ball.y + state.ball.vy * delta,
  };

  if (ball.y - BALL_RADIUS < 0 && ball.vy < 0) {
    ball.y = BALL_RADIUS;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + BALL_RADIUS > COURT_HEIGHT && ball.vy > 0) {
    ball.y = COURT_HEIGHT - BALL_RADIUS;
    ball.vy = -Math.abs(ball.vy);
  }

  const nextState: GameState = { ...state, humanY, aiY, ball };

  if (ball.vx < 0) {
    const collision = checkPaddleCrossing(
      previousX,
      previousY,
      ball,
      HUMAN_FACE,
      -1,
    );

    if (
      collision.crossed &&
      Math.abs(collision.y - humanY) <= PADDLE_HEIGHT / 2 + BALL_RADIUS
    ) {
      ball.y = clamp(collision.y, BALL_RADIUS, COURT_HEIGHT - BALL_RADIUS);
      ball.x = HUMAN_FACE + BALL_RADIUS;
      bounceOffPaddle(ball, humanY, 1);
    }
  } else if (ball.vx > 0) {
    const collision = checkPaddleCrossing(
      previousX,
      previousY,
      ball,
      AI_FACE,
      1,
    );

    if (
      collision.crossed &&
      Math.abs(collision.y - aiY) <= PADDLE_HEIGHT / 2 + BALL_RADIUS
    ) {
      ball.y = clamp(collision.y, BALL_RADIUS, COURT_HEIGHT - BALL_RADIUS);
      ball.x = AI_FACE - BALL_RADIUS;
      bounceOffPaddle(ball, aiY, -1);
    }
  }

  if (ball.x + BALL_RADIUS < 0) {
    return scorePoint(nextState, 'ai');
  }

  if (ball.x - BALL_RADIUS > COURT_WIDTH) {
    return scorePoint(nextState, 'human');
  }

  return nextState;
}
