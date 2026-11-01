import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { MatchList } from '../components/MatchList';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/auth-context';
import { mockProfile } from '../data/mockData';
import { useHashRoute } from '../hooks/useHashRoute';

function DashboardPage() {
  const { user } = useAuth();
  const { navigate } = useHashRoute();
  const { stats, matches } = mockProfile;
  const displayName = user?.displayName ?? 'Player';

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <>
            <Button
              icon={<Icon name="play" size={16} />}
              onClick={() => navigate('game')}
            >
              Play now
            </Button>
            <Button onClick={() => navigate('leaderboard')} variant="secondary">
              View leaderboard
            </Button>
          </>
        }
        eyebrow="Overview"
        subtitle="Your season at a glance. Keep the rally alive and climb the ladder."
        title={`Welcome back, ${displayName}`}
      />

      <section className="rank-banner card">
        <div className="rank-banner-main">
          <span className="rank-icon">
            <Icon name="trophy" size={26} />
          </span>
          <div>
            <p className="eyebrow">Season rank</p>
            <div className="rank-title">
              <strong>#{stats.rank}</strong>
              <span className="badge badge--accent">Top 5%</span>
            </div>
            <p className="rank-copy">
              You are 215 points away from a podium finish.
            </p>
          </div>
        </div>
        <div className="rank-progress">
          <div className="rank-progress-head">
            <span>Progress to #3</span>
            <strong>{stats.points} pts</strong>
          </div>
          <div className="progress-track">
            <span className="progress-fill" style={{ width: '72%' }} />
          </div>
          <div className="rank-progress-foot">
            <span>Diego · #3</span>
            <span>2,525 pts</span>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Player statistics">
        <StatCard
          detail="Across all seasons"
          icon="game"
          label="Games played"
          tone="accent"
          value={stats.gamesPlayed}
        />
        <StatCard
          detail="79% win rate"
          icon="trophy"
          label="Victories"
          tone="success"
          value={stats.wins}
        />
        <StatCard
          detail="Keep the losses small"
          icon="close"
          label="Defeats"
          tone="danger"
          value={stats.losses}
        />
        <StatCard
          detail={`${stats.wins} of ${stats.gamesPlayed} matches`}
          icon="target"
          label="Win rate"
          tone="neutral"
          value={`${stats.winRate}%`}
        />
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Latest results</p>
              <h2>Recent matches</h2>
            </div>
            <Button
              onClick={() => navigate('profile')}
              size="sm"
              variant="ghost"
            >
              Full history
              <Icon name="arrow" size={15} />
            </Button>
          </div>
          <MatchList limit={4} matches={matches} />
        </section>

        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Personal records</p>
              <h2>Best performances</h2>
            </div>
          </div>
          <div className="best-list">
            <div className="best-row">
              <span className="best-icon best-icon--flame">
                <Icon name="flame" size={18} />
              </span>
              <span>
                <span className="best-label">Longest win streak</span>
                <strong>{stats.bestStreak} wins</strong>
              </span>
            </div>
            <div className="best-row">
              <span className="best-icon best-icon--accent">
                <Icon name="target" size={18} />
              </span>
              <span>
                <span className="best-label">Best match score</span>
                <strong>{stats.bestScore}</strong>
              </span>
            </div>
            <div className="best-row">
              <span className="best-icon best-icon--success">
                <Icon name="leaderboard" size={18} />
              </span>
              <span>
                <span className="best-label">Highest rank</span>
                <strong>#{stats.rank} global</strong>
              </span>
            </div>
            <div className="best-row">
              <span className="best-icon best-icon--neutral">
                <Icon name="spark" size={18} />
              </span>
              <span>
                <span className="best-label">Season points</span>
                <strong>{stats.points.toLocaleString('en')} pts</strong>
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="action-grid" aria-label="Quick actions">
        <button
          className="action-card"
          onClick={() => navigate('game')}
          type="button"
        >
          <span className="action-icon">
            <Icon name="game" size={20} />
          </span>
          <span>
            <strong>Quick match</strong>
            <span>Step onto the table for a practice rally.</span>
          </span>
          <Icon name="arrow" size={18} />
        </button>
        <button
          className="action-card"
          onClick={() => navigate('leaderboard')}
          type="button"
        >
          <span className="action-icon">
            <Icon name="leaderboard" size={20} />
          </span>
          <span>
            <strong>Global ladder</strong>
            <span>See where you stand against every player.</span>
          </span>
          <Icon name="arrow" size={18} />
        </button>
        <button
          className="action-card"
          onClick={() => navigate('profile')}
          type="button"
        >
          <span className="action-icon">
            <Icon name="profile" size={20} />
          </span>
          <span>
            <strong>Player profile</strong>
            <span>Review your records and full match history.</span>
          </span>
          <Icon name="arrow" size={18} />
        </button>
      </section>
    </div>
  );
}

export default DashboardPage;
