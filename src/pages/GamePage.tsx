import { useEffect, useState } from 'react';
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
import { formatDuration } from '../lib/format';

type MatchStatus = 'idle' | 'playing' | 'paused' | 'finished';
type Side = 'home' | 'away';

interface Scores {
  home: number;
  away: number;
}

const OPPONENT = {
  name: 'SmashKing',
  accent: '#ffc857',
};

const WINNING_SCORE = 11;

const statusMeta: Record<MatchStatus, { label: string; tone: BadgeTone }> = {
  idle: { label: 'Ready', tone: 'neutral' },
  playing: { label: 'Live', tone: 'accent' },
  paused: { label: 'Paused', tone: 'warning' },
  finished: { label: 'Match over', tone: 'success' },
};

function GamePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<MatchStatus>('idle');
  const [scores, setScores] = useState<Scores>({ home: 0, away: 0 });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  if (!user) {
    return null;
  }

  const activeStatus = statusMeta[status];
  const winner =
    scores.home >= WINNING_SCORE
      ? user.username
      : scores.away >= WINNING_SCORE
        ? OPPONENT.name
        : null;

  const startMatch = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('playing');
    }
  };

  const pauseMatch = () => {
    if (status === 'playing') {
      setStatus('paused');
    }
  };

  const resetMatch = () => {
    setStatus('idle');
    setScores({ home: 0, away: 0 });
    setElapsed(0);
  };

  const addPoint = (side: Side) => {
    if (status !== 'playing') {
      return;
    }

    const nextScores = {
      home: scores.home + (side === 'home' ? 1 : 0),
      away: scores.away + (side === 'away' ? 1 : 0),
    };

    setScores(nextScores);

    if (nextScores.home >= WINNING_SCORE || nextScores.away >= WINNING_SCORE) {
      setStatus('finished');
    }
  };

  return (
    <div className="page game-page">
      <PageHeader
        eyebrow="The arena"
        title="Play a match"
        description="A visual match prototype with a live scoreboard and simulated points."
        actions={<Badge tone={activeStatus.tone}>{activeStatus.label}</Badge>}
      />

      <div className="game-layout">
        <Card className="game-card">
          <div className="game-topbar">
            <div>
              <p className="eyebrow">Ranked match</p>
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
                {scores.home}
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
                {scores.away}
              </span>
              <div className="score-player">
                <span>Opponent</span>
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
            <span className="ping-paddle ping-paddle-left" />
            <span className="ping-paddle ping-paddle-right" />
            <span className="ping-ball" />

            {status === 'idle' ? (
              <div className="field-overlay">
                <strong>Ready when you are</strong>
                <span>Press start to begin the rally.</span>
              </div>
            ) : null}

            {status === 'paused' ? (
              <div className="field-overlay">
                <strong>Match paused</strong>
                <span>Resume when you are ready.</span>
              </div>
            ) : null}

            {status === 'finished' && winner ? (
              <div className="field-overlay field-winner">
                <TrophyIcon />
                <strong>{winner} wins</strong>
                <span>
                  {scores.home} – {scores.away}
                </span>
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
              <Button variant="ghost" onClick={resetMatch}>
                <ResetIcon />
                Reset
              </Button>
            </div>
            <span className="control-hint">
              Visual prototype — no ball physics required.
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
                <dd>Ranked</dd>
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
                <p className="eyebrow">Scoreboard controls</p>
                <h2>Simulate a point</h2>
              </div>
              <Badge tone={status === 'playing' ? 'accent' : 'neutral'}>
                {status === 'playing' ? 'Unlocked' : 'Start match'}
              </Badge>
            </div>
            <p className="panel-copy">
              Award a point to either player while the match is live.
            </p>
            <div className="point-grid">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => addPoint('home')}
                disabled={status !== 'playing'}
              >
                +1 {user.username}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => addPoint('away')}
                disabled={status !== 'playing'}
              >
                +1 {OPPONENT.name}
              </Button>
            </div>
          </Card>

          <Card className="panel-card tip-card">
            <span className="tip-icon">
              <ZapIcon />
            </span>
            <div>
              <h2>Prototype mode</h2>
              <p>
                Start, pause and reset the match. Points are awarded manually so
                the visual flow can be explored without game physics.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default GamePage;
