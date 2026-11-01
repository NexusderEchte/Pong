import { useAuth } from '../context/AuthContext';
import { MOCK_STATS, MOCK_HISTORY } from '../lib/mockData';
import { Card } from '../components/Card';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="section">
      <div
        className="flex justify-between"
        style={{ alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h2>Spielerprofil</h2>
          <p>Ihr persönliches Profil und Ihre Spielhistorie.</p>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: '1.5rem' }}>
        <Card>
          <h3>Profilinformationen</h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div className="flex justify-between">
              <span className="text-text-muted">Benutzername</span>
              <span>{user?.username ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">E-Mail</span>
              <span>{user?.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Mitglied seit</span>
              <span>Heute</span>
            </div>
          </div>
        </Card>
        <Card>
          <h3>Statistiken</h3>
          <div className="grid cols-2" style={{ marginTop: '1rem' }}>
            {MOCK_STATS.map((stat) => (
              <Card
                key={stat.label}
                className="stat-card"
                style={{ padding: '1rem' }}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Card>
          <div
            className="flex justify-between"
            style={{ alignItems: 'baseline', marginBottom: '1rem' }}
          >
            <h3>Spielhistorie</h3>
          </div>
          {MOCK_HISTORY.length === 0 ? (
            <div className="empty-state">Noch keine Spiele gespielt.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Gegner</th>
                  <th>Ergebnis</th>
                  <th>Punktzahl</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((match) => (
                  <tr key={match.id}>
                    <td>{match.opponent}</td>
                    <td>
                      <span
                        className={`badge ${
                          match.result === 'win'
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}
                      >
                        {match.result === 'win' ? 'Sieg' : 'Niederlage'}
                      </span>
                    </td>
                    <td>{match.score}</td>
                    <td>{match.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </section>
  );
}
