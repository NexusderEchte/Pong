import { MOCK_LEADERBOARD } from '../lib/mockData';
import { Card } from '../components/Card';

export default function LeaderboardPage() {
  return (
    <section className="section">
      <div
        className="flex justify-between"
        style={{ alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h2>Globale Rangliste</h2>
          <p>Die besten Spieler der Ping Pong-Community.</p>
        </div>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Spieler</th>
              <th>Siege</th>
              <th>Niederlagen</th>
              <th>Punkte</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((entry) => (
              <tr
                key={entry.username}
                className={entry.rank <= 3 ? 'top-three' : undefined}
              >
                <td>
                  <span className="badge badge-primary">#{entry.rank}</span>
                </td>
                <td>
                  <span
                    className={`font-bold ${entry.rank <= 3 ? 'text-primary' : ''}`}
                  >
                    {entry.username}
                  </span>{' '}
                  {entry.rank <= 3 && entry.rank === 1 && '👑'}
                </td>
                <td>{entry.wins}</td>
                <td>{entry.losses}</td>
                <td>{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          className="game-status"
          style={{ marginTop: '1rem', textAlign: 'center' }}
        >
          Die Top 3 Spieler sind hervorgehoben. Daten sind Mock-Daten
          (Prototyp).
        </p>
      </Card>
    </section>
  );
}
