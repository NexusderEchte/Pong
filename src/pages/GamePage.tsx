import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState<string | null>(null);

  const startGame = () => {
    setScore({ left: 0, right: 0 });
    setWinner(null);
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  const scorePoint = (side: 'left' | 'right') => {
    if (!isPlaying || winner) return;
    setScore((prev) => {
      const next = { ...prev, [side]: prev[side] + 1 };
      if (next.left >= 5) setWinner('Linker Spieler');
      if (next.right >= 5) setWinner('Rechter Spieler');
      return next;
    });
  };

  return (
    <section className="section">
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2>Ping Pong</h2>
            <p className="game-status">
              {winner
                ? `Spiel beendet: ${winner} gewinnt!`
                : isPlaying
                  ? 'Spiel läuft'
                  : 'Spiel pausiert'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={pauseGame} disabled={!isPlaying}>
              Pausieren
            </Button>
            <Button onClick={startGame} disabled={isPlaying && !winner}>
              {winner ? 'Neustart' : 'Start'}
            </Button>
          </div>
        </div>

        <div className={`game-board ${isPlaying ? 'playing' : ''}`}>
          <div className="game-court" />
          <div className="game-net" />
          <div className="game-paddle left" />
          <div className="game-paddle right" />
          <div className="game-ball" />
          <div className="game-score">
            <div className="score-player">{score.left}</div>
            <div className="score-player">{score.right}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={() => scorePoint('left')}
            disabled={!isPlaying || winner !== null}
          >
            Punkt: Linker Spieler
          </Button>
          <Button
            onClick={() => scorePoint('right')}
            disabled={!isPlaying || winner !== null}
          >
            Punkt: Rechter Spieler
          </Button>
        </div>

        <div className="game-controls">
          <p>
            Visueller Prototyp: Punkt-Buttons simulieren den Spielverlauf.
            Rechter Spieler wird automatisch gesteuert.
          </p>
        </div>
      </Card>
    </section>
  );
}
