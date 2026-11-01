import { useEffect, useRef, useState } from 'react';
import {
  ClockIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
} from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import {
  COURT_HEIGHT,
  COURT_WIDTH,
  WINNING_SCORE,
  createInitialState,
  pauseGame,
  startGame,
  stepGame,
  type GameStatus,
  type PaddleInput,
} from '../game/pong';
import { formatDuration } from '../lib/format';

const OPPONENT = {
  name: 'SmashKing',
  accent: '#ffc857',
};

const statusMeta: Record<GameStatus, { label: string; tone: BadgeTone }> = {
  ready: { label: 'Ready', tone: 'neutral' },
  playing: { label: 'Live', tone: 'accent' },
  paused: { label: 'Paused', tone: 'warning' },
  finished: { label: 'Game over', tone: 'success' },
};

function GamePage() {
  const { user } = useAuth();
  const [game, setGame] = useState(createInitialState);
  const [elapsed, setElapsed] = useState(0);
  const keysRef = useRef<PaddleInput>({ up: false, down: false });

  useEffect(() => {
    if (game.status !== 'playing') {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.status]);

  useEffect(() => {
    if (game.status !== 'playing') {
      return;
    }

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = (now - previous) / 1000;
      previous = now;

      setGame((current) => stepGame(current, delta, keysRef.current));
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [game.status]);

  useEffect(() => {
    const setPressed = (key: string, pressed: boolean): boolean => {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        keysRef.current.up = pressed;
        return true;
      }

      if (key === 'ArrowDown' || key === 's' || key === 'S') {
        keysRef.current.down = pressed;
        return true;
      }

      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!setPressed(event.key, true)) {
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressed(event.key, false);
    };

    const releaseKeys = () => {
      keysRef.current = { up: false, down: false };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseKeys);
    };
  }, []);

  if (!user) {
    return null;
  }

  const { status, scores, winner } = game;
  const activeStatus = statusMeta[status];
  const winnerName =
    winner === 'human' ? user.username : winner === 'ai' ? OPPONENT.name : null;

  const humanPaddleStyle = {
    top: `${(game.humanY / COURT_HEIGHT) * 100}%`,
  };
  const aiPaddleStyle = {
    top: `${(game.aiY / COURT_HEIGHT) * 100}%`,
  };
  const ballStyle = {
    left: `${(game.ball.x / COURT_WIDTH) * 100}%`,
    top: `${(game.ball.y / COURT_HEIGHT) * 100}%`,
  };

  const startMatch = () => {
    if (status === 'ready') {
      setElapsed(0);
    }

    setGame(startGame);
  };

  const pauseMatch = () => {
    setGame(pauseGame);
  };

  const restartMatch = () => {
    setGame(createInitialState());
    setElapsed(0);
    keysRef.current = { up: false, down: false };
  };

  return (
    <div className="page game-page">
      <PageHeader
        eyebrow="The arena"
        title="Play a match"
        description="Take on the AI opponent in a real match. First to five wins."
        actions={<Badge tone={activeStatus.tone}>{activeStatus.label}</Badge>}
      />

      <div className="game-layout">
        <Card className="game-card">
          <div className="game-topbar">
            <div>
              <p className="eyebrow">Solo match</p>
              <strong>First to {WINNING_SCORE}</strong>
            </div>
            <div className="match-status" role="status" aria-live="polite">
              <span className={`status-dot status-${status}`} />
              <span>{activeStatus.label}</span>
              <span className="match-timer">
                <ClockIcon />
                {formatDuration(elapsed)}
              </span>
            </div>
          </div>

          <div className="scoreboard" aria-live="polite">
            <div className="score-side">
              <Avatar
                name={user.username}
                accent={user.accent}
                size="lg"
                className="score-avatar"
              />
              <div className="score-player">
                <span>You</span>
                <strong>{user.username}</strong>
              </div>
              <span
                className="score-number"
                aria-label={`${user.username} score`}
              >
                {scores.human}
              </span>
            </div>

            <div className="score-divider">
              <span>vs</span>
              <span className="score-set">Match 1</span>
            </div>

            <div className="score-side score-side-away">
              <span
                className="score-number"
                aria-label={`${OPPONENT.name} score`}
              >
                {scores.ai}
              </span>
              <div className="score-player">
                <span>AI opponent</span>
                <strong>{OPPONENT.name}</strong>
              </div>
              <Avatar
                name={OPPONENT.name}
                accent={OPPONENT.accent}
                size="lg"
                className="score-avatar"
              />
            </div>
          </div>

          <div className={`ping-field status-${status}`}>
            <div className="field-center-line" />
            <div className="field-net" />
            <span
              className="ping-paddle ping-paddle-left"
              style={humanPaddleStyle}
              data-testid="human-paddle"
            />
            <span
              className="ping-paddle ping-paddle-right"
              style={aiPaddleStyle}
              data-testid="ai-paddle"
            />
            <span
              className="ping-ball"
              style={ballStyle}
              data-testid="ping-ball"
            />

            {status === 'ready' ? (
              <div className="field-overlay">
                <strong>Ready when you are</strong>
                <span>
                  Start the match, then move with W/S or the arrow keys.
                </span>
              </div>
            ) : null}

            {status === 'paused' ? (
              <div className="field-overlay">
                <strong>Match paused</strong>
                <span>Resume when you are ready.</span>
              </div>
            ) : null}

            {status === 'finished' && winnerName ? (
              <div className="field-overlay field-winner">
                <TrophyIcon />
                <strong>{winnerName} wins</strong>
                <span>
                  {scores.human} – {scores.ai}
                </span>
                <Button size="sm" onClick={restartMatch}>
                  <ResetIcon />
                  Play again
                </Button>
              </div>
            ) : null}
          </div>

          <div className="game-controls">
            <div className="control-buttons">
              <Button
                onClick={startMatch}
                disabled={status === 'playing' || status === 'finished'}
              >
                <PlayIcon />
                {status === 'paused' ? 'Resume match' : 'Start match'}
              </Button>
              <Button
                variant="secondary"
                onClick={pauseMatch}
                disabled={status !== 'playing'}
              >
                <PauseIcon />
                Pause
              </Button>
              <Button variant="ghost" onClick={restartMatch}>
                <ResetIcon />
                Restart
              </Button>
            </div>
            <span className="control-hint">
              Move up with W or ↑, down with S or ↓.
            </span>
          </div>
        </Card>

        <aside className="game-side">
          <Card className="panel-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Match setup</p>
                <h2>Tonight's table</h2>
              </div>
              <span className="heading-icon">
                <TargetIcon />
              </span>
            </div>
            <dl className="setup-list">
              <div>
                <dt>Mode</dt>
                <dd>Solo vs AI</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>First to {WINNING_SCORE}</dd>
              </div>
              <div>
                <dt>Server</dt>
                <dd>{user.username}</dd>
              </div>
              <div>
                <dt>Opponent</dt>
                <dd>{OPPONENT.name}</dd>
              </div>
            </dl>
          </Card>

          <Card className="panel-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>Move your paddle</h2>
              </div>
              <Badge tone="neutral">Keyboard</Badge>
            </div>
            <dl className="setup-list">
              <div>
                <dt>Move up</dt>
                <dd>W / ↑</dd>
              </div>
              <div>
                <dt>Move down</dt>
                <dd>S / ↓</dd>
              </div>
              <div>
                <dt>Pause</dt>
                <dd>Pause button</dd>
              </div>
            </dl>
          </Card>

          <Card className="panel-card tip-card">
            <span className="tip-icon">
              <ZapIcon />
            </span>
            <div>
              <h2>Beat the bot</h2>
              <p>
                The AI tracks the ball and anticipates wall bounces. Use sharp
                angles and quick reactions to win the rally.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default GamePage;
