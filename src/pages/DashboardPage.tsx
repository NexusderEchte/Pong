import { MOCK_STATS } from '../lib/mockData';
import { Card } from '../components/Card';

export default function DashboardPage() {
  return (
    <section className="section">
      <div
        className="flex justify-between"
        style={{ alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h2>Dashboard</h2>
          <p>Ihre Spielerstatistiken auf einen Blick.</p>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginTop: '1.5rem' }}>
        {MOCK_STATS.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid cols-2" style={{ marginTop: '2rem' }}>
        <Card>
          <h3>Schnellstart</h3>
          <p>Starten Sie eine neue Partie oder öffnen Sie Ihr Profil.</p>
        </Card>
        <Card>
          <h3>Letzte Aktivitäten</h3>
          <p>Keine aktuellen Aktivitäten vorhanden.</p>
        </Card>
      </div>
    </section>
  );
}
