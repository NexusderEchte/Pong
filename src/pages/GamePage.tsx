import { useState } from 'react';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { PageHeader } from '../components/PageHeader';
import { PongTable } from '../components/PongTable';
import { ScoreBoard } from '../components/ScoreBoard';
import { useAuth } from '../context/auth-context';
import { mockLeaderboard } from '../data/mockData';

function GamePage() {
  const { user } = useAuth();
  const opponent = mockLeaderboard[0].username;
  const playerName = user?.displayName ?? 'You';
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const resetMatch = () => {
    setLeftScore(0);
    setRightScore(0);
    setIsPlaying(false);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="The table"
        subtitle="A visual practice rally. Use the controls to preview the match interface."
        title="Quick match"
      />

      <div className="game-layout">
        <section className="card game-arena">
          <ScoreBoard
            leftLabel="You"
            leftName={playerName}
            leftScore={leftScore}
            onLeftPoint={() => setLeftScore((score) => score + 1)}
            onRightPoint={() => setRightScore((score) => score + 1)}
            rightLabel="Opponent"
            rightName={opponent}
            rightScore={rightScore}
          />

          <PongTable
            leftName={playerName}
            playing={isPlaying}
            rightName={opponent}
          />

          <div className="game-controls">
            <div className="game-control-buttons">
              <Button
                disabled={isPlaying}
                icon={<Icon name="play" size={16} />}
                onClick={() => setIsPlaying(true)}
              >
                Start
              </Button>
              <Button
                disabled={!isPlaying}
                icon={<Icon name="pause" size={16} />}
                onClick={() => setIsPlaying(false)}
                variant="secondary"
              >
                Pause
              </Button>
              <Button
                icon={<Icon name="reset" size={16} />}
                onClick={resetMatch}
                variant="ghost"
              >
                Reset
              </Button>
            </div>

            <p aria-live="polite" className="game-status" role="status">
              <span
                className={
                  isPlaying ? 'status-dot status-dot--live' : 'status-dot'
                }
              />
              {isPlaying ? 'Rally in progress' : 'Match paused'}
            </p>
          </div>
        </section>

        <aside className="game-side">
          <section className="card">
            <p className="eyebrow">Match info</p>
            <h2>Practice rally</h2>
            <dl className="info-list">
              <div>
                <dt>Opponent</dt>
                <dd>{opponent}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>First to 11</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>Casual</dd>
              </div>
              <div>
                <dt>Table</dt>
                <dd>Arena 01</dd>
              </div>
            </dl>
          </section>

          <section className="card prototype-note">
            <span className="prototype-note-icon">
              <Icon name="spark" size={18} />
            </span>
            <div>
              <h3>Prototype controls</h3>
              <p>
                Start and pause the rally, or use the +1 buttons to move the
                score. Full match physics arrives in a later milestone.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default GamePage;
