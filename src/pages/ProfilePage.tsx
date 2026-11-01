import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import { MatchList } from '../components/MatchList';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/auth-context';
import { mockProfile } from '../data/mockData';
import { useHashRoute } from '../hooks/useHashRoute';
import { formatDate } from '../lib/format';

function ProfilePage() {
  const { user } = useAuth();
  const { navigate } = useHashRoute();
  const { stats, matches, bio, joinedAt } = mockProfile;
  const displayName = user?.displayName ?? mockProfile.displayName;
  const username = user?.username ?? mockProfile.username;
  const email = user?.email ?? 'nova@pingpong.dev';

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Player card"
        subtitle="Your identity, records and every rally that got you here."
        title="Player profile"
      />

      <section className="card profile-hero">
        <Avatar className="profile-avatar" name={displayName} size="xl" />

        <div className="profile-identity">
          <div className="profile-name-row">
            <h2>{displayName}</h2>
            <span className="badge badge--accent">Rank #{stats.rank}</span>
          </div>
          <p className="profile-handle">@{username}</p>
          <p className="profile-bio">{bio}</p>
          <div className="profile-meta">
            <span>
              <Icon name="mail" size={15} />
              {email}
            </span>
            <span>
              <Icon name="pin" size={15} />
              {mockProfile.country}
            </span>
            <span>
              <Icon name="calendar" size={15} />
              Joined {formatDate(joinedAt)}
            </span>
          </div>
        </div>

        <div className="profile-hero-actions">
          <Button
            icon={<Icon name="play" size={16} />}
            onClick={() => navigate('game')}
          >
            Quick match
          </Button>
          <Button onClick={() => navigate('leaderboard')} variant="secondary">
            Leaderboard
          </Button>
        </div>
      </section>

      <section className="stats-grid" aria-label="Profile statistics">
        <StatCard
          detail={`${stats.gamesPlayed} total matches`}
          icon="game"
          label="Games played"
          value={stats.gamesPlayed}
        />
        <StatCard
          detail="Lifetime victories"
          icon="trophy"
          label="Wins"
          tone="success"
          value={stats.wins}
        />
        <StatCard
          detail="Lifetime defeats"
          icon="close"
          label="Losses"
          tone="danger"
          value={stats.losses}
        />
        <StatCard
          detail={`${stats.points.toLocaleString('en')} season points`}
          icon="target"
          label="Win rate"
          tone="neutral"
          value={`${stats.winRate}%`}
        />
      </section>

      <div className="profile-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">About</p>
              <h2>Player details</h2>
            </div>
          </div>
          <dl className="info-list">
            <div>
              <dt>Username</dt>
              <dd>@{username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{mockProfile.country}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(joinedAt)}</dd>
            </div>
            <div>
              <dt>Best streak</dt>
              <dd>{stats.bestStreak} wins</dd>
            </div>
            <div>
              <dt>Best score</dt>
              <dd>{stats.bestScore}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Rally log</p>
              <h2>Match history</h2>
            </div>
            <span className="badge badge--muted">
              {matches.length} recent matches
            </span>
          </div>
          <MatchList matches={matches} />
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
