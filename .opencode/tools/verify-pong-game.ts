import { tool } from '@opencode-ai/plugin';
import {
  BALL_RADIUS,
  BASE_BALL_SPEED,
  COURT_HEIGHT,
  COURT_WIDTH,
  WINNING_SCORE,
  createInitialState,
  pauseGame,
  stepGame,
  type GameState,
} from '../../src/game/pong.ts';

interface Assertion {
  id: string;
  ok: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

interface ScenarioResult {
  id: string;
  status: 'passed' | 'failed';
  assertions: Assertion[];
}

export interface VerifyPongGameReport {
  ok: boolean;
  scenarios: ScenarioResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

const IDLE = { up: false, down: false };
const DELTA = 1 / 60;

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

function describe(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return JSON.stringify(value) ?? String(value);
}

function check(
  id: string,
  ok: boolean,
  expected: unknown,
  actual: unknown,
  message: string,
): Assertion {
  return {
    id,
    ok,
    expected,
    actual,
    message: ok
      ? message
      : `${message} (expected ${describe(expected)}, got ${describe(actual)})`,
  };
}

function scenario(id: string, assertions: Assertion[]): ScenarioResult {
  return {
    id,
    status: assertions.every((assertion) => assertion.ok) ? 'passed' : 'failed',
    assertions,
  };
}

export function runVerifyPongGame(): VerifyPongGameReport {
  const scenarios: ScenarioResult[] = [];

  const humanPaddleState = playingState({
    humanY: COURT_HEIGHT / 2,
    ball: {
      x: 8.4,
      y: COURT_HEIGHT / 2,
      vx: -BASE_BALL_SPEED,
      vy: 0,
    },
  });
  const afterHumanPaddle = stepGame(humanPaddleState, DELTA, IDLE);

  const aiPaddleState = playingState({
    aiY: COURT_HEIGHT / 2,
    ball: {
      x: COURT_WIDTH - 8.5,
      y: COURT_HEIGHT / 2,
      vx: BASE_BALL_SPEED,
      vy: 0,
    },
  });
  const afterAiPaddle = stepGame(aiPaddleState, DELTA, IDLE);

  scenarios.push(
    scenario('paddle-collision', [
      check(
        'human-paddle-reverses-ball',
        afterHumanPaddle.ball.vx > 0,
        'vx > 0',
        afterHumanPaddle.ball.vx,
        'The ball should reverse horizontal direction after hitting the human paddle.',
      ),
      check(
        'human-paddle-keeps-ball-in-court',
        afterHumanPaddle.ball.x > 8,
        'x > 8',
        afterHumanPaddle.ball.x,
        'The ball should be repositioned in front of the human paddle.',
      ),
      check(
        'ai-paddle-reverses-ball',
        afterAiPaddle.ball.vx < 0,
        'vx < 0',
        afterAiPaddle.ball.vx,
        'The ball should reverse horizontal direction after hitting the AI paddle.',
      ),
    ]),
  );

  const wallState = playingState({
    ball: {
      x: COURT_WIDTH / 2,
      y: BALL_RADIUS,
      vx: 20,
      vy: -40,
    },
  });
  const afterWall = stepGame(wallState, DELTA, IDLE);

  scenarios.push(
    scenario('wall-collision', [
      check(
        'wall-reverses-vertical-velocity',
        afterWall.ball.vy > 0,
        'vy > 0',
        afterWall.ball.vy,
        'The ball should bounce downward after hitting the top wall.',
      ),
      check(
        'wall-keeps-ball-in-court',
        afterWall.ball.y >= BALL_RADIUS,
        `y >= ${BALL_RADIUS}`,
        afterWall.ball.y,
        'The ball should stay inside the court after the wall bounce.',
      ),
    ]),
  );

  const aiScoreState = playingState({
    ball: { x: -2, y: COURT_HEIGHT / 2, vx: -20, vy: 0 },
  });
  const afterAiScore = stepGame(aiScoreState, DELTA, IDLE);

  const humanScoreState = playingState({
    ball: {
      x: COURT_WIDTH + 2,
      y: COURT_HEIGHT / 2,
      vx: 20,
      vy: 0,
    },
  });
  const afterHumanScore = stepGame(humanScoreState, DELTA, IDLE);

  scenarios.push(
    scenario('scoring', [
      check(
        'ai-scores-when-ball-passes-human-paddle',
        afterAiScore.scores.ai === 1 && afterAiScore.scores.human === 0,
        { human: 0, ai: 1 },
        afterAiScore.scores,
        'The AI should score when the ball passes the human paddle.',
      ),
      check(
        'serve-goes-to-loser-after-ai-score',
        afterAiScore.ball.x === COURT_WIDTH / 2 && afterAiScore.ball.vx < 0,
        `x = ${COURT_WIDTH / 2} and vx < 0`,
        { x: afterAiScore.ball.x, vx: afterAiScore.ball.vx },
        'The ball should reset and serve toward the player who conceded.',
      ),
      check(
        'human-scores-when-ball-passes-ai-paddle',
        afterHumanScore.scores.human === 1 && afterHumanScore.scores.ai === 0,
        { human: 1, ai: 0 },
        afterHumanScore.scores,
        'The human should score when the ball passes the AI paddle.',
      ),
    ]),
  );

  const winningState = playingState({
    scores: { human: WINNING_SCORE - 1, ai: 2 },
    ball: {
      x: COURT_WIDTH + 2,
      y: COURT_HEIGHT / 2,
      vx: 20,
      vy: 0,
    },
  });
  const afterWin = stepGame(winningState, DELTA, IDLE);

  scenarios.push(
    scenario('winning-condition', [
      check(
        'winner-reaches-winning-score',
        afterWin.scores.human === WINNING_SCORE && afterWin.winner === 'human',
        { score: WINNING_SCORE, winner: 'human' },
        { score: afterWin.scores.human, winner: afterWin.winner },
        'The player reaching the winning score should be declared the winner.',
      ),
      check(
        'game-stops-after-win',
        afterWin.status === 'finished' &&
          afterWin.ball.vx === 0 &&
          afterWin.ball.vy === 0,
        { status: 'finished', vx: 0, vy: 0 },
        {
          status: afterWin.status,
          vx: afterWin.ball.vx,
          vy: afterWin.ball.vy,
        },
        'The game should stop and the ball should no longer move after a win.',
      ),
    ]),
  );

  const activeState = playingState({
    humanY: COURT_HEIGHT / 2,
    ball: {
      x: 40,
      y: COURT_HEIGHT / 2,
      vx: 60,
      vy: 0,
    },
  });
  const paused = pauseGame(activeState);
  const afterPause = stepGame(paused, DELTA, { up: true, down: false });

  scenarios.push(
    scenario('pause', [
      check(
        'paused-state-is-unchanged',
        afterPause === paused,
        true,
        afterPause === paused,
        'Stepping a paused game should return the unchanged state.',
      ),
      check(
        'paused-ball-does-not-move',
        afterPause.ball.x === paused.ball.x &&
          afterPause.ball.y === paused.ball.y,
        { x: paused.ball.x, y: paused.ball.y },
        { x: afterPause.ball.x, y: afterPause.ball.y },
        'The ball should not move while the game is paused.',
      ),
      check(
        'paused-paddle-does-not-move',
        afterPause.humanY === paused.humanY,
        paused.humanY,
        afterPause.humanY,
        'The paddle should not move while the game is paused.',
      ),
    ]),
  );

  const passed = scenarios.filter(
    (scenarioResult) => scenarioResult.status === 'passed',
  ).length;
  const failed = scenarios.length - passed;

  return {
    ok: failed === 0,
    scenarios,
    summary: {
      total: scenarios.length,
      passed,
      failed,
    },
  };
}

export default tool({
  description:
    'Runs deterministic Pong engine scenarios for paddle collision, wall collision, scoring, winning condition and pause. Returns structured JSON.',
  args: {},
  async execute() {
    return JSON.stringify(runVerifyPongGame(), null, 2);
  },
});
