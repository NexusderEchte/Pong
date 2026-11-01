import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BallIcon,
  FlameIcon,
  PlayIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { getMatchHistory } from '../data/mockData';
import { formatNumber, formatShortDate } from '../lib/format';
import { useRouter } from '../lib/RouterContext';

function DashboardPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  if (!user) {
    return null;
  }

  const { stats } = user;
  const history = getMatchHistory(user);
  const recentMatches = history.slice(0, 4);
  const recentForm = history.slice(0, 5);
  const rankLabel = stats.rank > 0 ? `#${stats.rank}` : '—';
  const nextMilestone = Math.max(25, Math.ceil((stats.wins + 1) / 25) * 25);
  const winsToGo = nextMilestone - stats.wins;
  const milestoneProgress = Math.min(
    100,
    Math.round((stats.wins / nextMilestone) * 100),
  );

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Season overview"
        title={`Welcome back, ${user.username}`}
        description="Here is how your table tennis season is shaping up."
        actions={
          <Button onClick={() => navigate('game')}>
            <PlayIcon />
            Play a match
          </Button>
        }
      />

      <section className="stat-grid" aria-label="Player statistics">
        <StatCard
          label="Matches played"
          value={formatNumber(stats.matches)}
          hint="Across all modes"
          icon={<BallIcon />}
          tone="blue"
        />
        <StatCard
          label="Wins"
          value={formatNumber(stats.wins)}
          hint="Keep the streak alive"
          icon={<TrophyIcon />}
          tone="accent"
        />
        <StatCard
          label="Losses"
          value={formatNumber(stats.losses)}
          hint="Lessons on the table"
          icon={<TargetIcon />}
          tone="danger"
        />
        <StatCard
          label="Ranking points"
          value={formatNumber(stats.points)}
          hint={`Global rank ${rankLabel}`}
          icon={<ZapIcon />}
          tone="warning"
        />
      </section>

      <div className="dashboard-grid">
        <Card className="panel-card recent-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Last matches</p>
              <h2>Recent results</h2>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate('profile')}
            >
              View history
              <ArrowRightIcon />
            </button>
          </div>

          {recentForm.length > 0 ? (
            <div className="form-strip" aria-label="Recent form">
              <span>Form</span>
              <div className="form-badges">
                {recentForm.map((match) => (
                  <span
                    key={match.id}
                    className={`form-badge form-${match.result}`}
                    title={`${match.result === 'win' ? 'Win' : 'Loss'} vs ${match.opponent}`}
                  >
                    {match.result === 'win' ? 'W' : 'L'}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {recentMatches.length > 0 ? (
            <>
              <ul className="match-list">
                {recentMatches.map((match) => {
                  const won = match.result === 'win';

                  return (
                    <li key={match.id} className="match-row">
                      <span
                        className={`match-result-icon ${won ? 'is-win' : 'is-loss'}`.trim()}
                      >
                        {won ? 'W' : 'L'}
                      </span>
                      <div className="match-opponent">
                        <strong>{match.opponent}</strong>
                        <span>
                          {match.mode} · {formatShortDate(match.playedAt)}
                        </span>
                      </div>
                      <span className="match-score">
                        {match.playerScore} – {match.opponentScore}
                      </span>
                      <Badge tone={won ? 'success' : 'danger'}>
                        {won ? 'Win' : 'Loss'}
                      </Badge>
                    </li>
                  );
                })}
              </ul>

              <div className="dashboard-insight">
                <div className="insight-head">
                  <span>
                    <TargetIcon />
                    Next milestone
                  </span>
                  <Badge tone="accent">{winsToGo} wins to go</Badge>
                </div>
                <p>Reach {nextMilestone} career wins and keep the run going.</p>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={milestoneProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress towards ${nextMilestone} wins`}
                >
                  <span style={{ width: `${milestoneProgress}%` }} />
                </div>
                <div className="insight-scale">
                  <span>{stats.wins} wins</span>
                  <span>{nextMilestone}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <BallIcon />
              </span>
              <h3>No matches yet</h3>
              <p>Your first result will show up here once you hit the table.</p>
              <Button size="sm" onClick={() => navigate('game')}>
                Play your first match
              </Button>
            </div>
          )}
        </Card>

        <div className="dashboard-side">
          <Card className="panel-card performance-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Season performance</p>
                <h2>Win rate</h2>
              </div>
              <Badge tone="accent">{stats.winRate}%</Badge>
            </div>

            <div className="performance-body">
              <div
                className="win-ring"
                style={{
                  background: `conic-gradient(var(--accent) ${
                    stats.winRate * 3.6
                  }deg, rgba(255, 255, 255, 0.07) 0deg)`,
                }}
              >
                <div className="win-ring-inner">
                  <strong>{stats.winRate}%</strong>
                  <span>
                    {stats.wins}W · {stats.losses}L
                  </span>
                </div>
              </div>

              <dl className="performance-meta">
                <div>
                  <dt>Global rank</dt>
                  <dd>{rankLabel}</dd>
                </div>
                <div>
                  <dt>Avg. points</dt>
                  <dd>{stats.averagePoints}</dd>
                </div>
                <div>
                  <dt>Tournaments</dt>
                  <dd>{stats.tournamentsWon}</dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card className="panel-card bests-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">Standout numbers</p>
                <h2>Personal bests</h2>
              </div>
              <span className="heading-icon">
                <FlameIcon />
              </span>
            </div>

            <ul className="best-list">
              <li>
                <span className="best-icon">
                  <FlameIcon />
                </span>
                <div>
                  <span>Longest win streak</span>
                  <strong>{stats.bestStreak} matches</strong>
                </div>
              </li>
              <li>
                <span className="best-icon">
                  <TargetIcon />
                </span>
                <div>
                  <span>Best match score</span>
                  <strong>{stats.bestScore}</strong>
                </div>
              </li>
              <li>
                <span className="best-icon">
                  <TrophyIcon />
                </span>
                <div>
                  <span>Tournaments won</span>
                  <strong>{stats.tournamentsWon}</strong>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <section className="quick-grid" aria-label="Quick navigation">
        <button
          type="button"
          className="quick-card"
          onClick={() => navigate('game')}
        >
          <span className="quick-icon quick-icon-accent">
            <PlayIcon />
          </span>
          <span className="quick-copy">
            <strong>Play a match</strong>
            <span>Open the table and start a rally.</span>
          </span>
          <ArrowUpRightIcon className="quick-arrow" />
        </button>
        <button
          type="button"
          className="quick-card"
          onClick={() => navigate('leaderboard')}
        >
          <span className="quick-icon quick-icon-warning">
            <TrophyIcon />
          </span>
          <span className="quick-copy">
            <strong>Leaderboard</strong>
            <span>See who is setting the pace this season.</span>
          </span>
          <ArrowUpRightIcon className="quick-arrow" />
        </button>
        <button
          type="button"
          className="quick-card"
          onClick={() => navigate('profile')}
        >
          <span className="quick-icon quick-icon-blue">
            <UserIcon />
          </span>
          <span className="quick-copy">
            <strong>Your profile</strong>
            <span>Review your stats, bests and match history.</span>
          </span>
          <ArrowUpRightIcon className="quick-arrow" />
        </button>
      </section>
    </div>
  );
}

export default DashboardPage;
