import {
  BallIcon,
  CalendarIcon,
  FlameIcon,
  MailIcon,
  MapPinIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
} from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { formatMonthYear, formatNumber, formatShortDate } from '../lib/format';
import { useRouter } from '../lib/RouterContext';
import { useMatchHistory } from '../lib/useMatchHistory';

const opponentAccents = ['#ffc857', '#4da3ff', '#ff6b7a', '#b18cff', '#22e6a6'];

function ProfilePage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { history, error: historyError } = useMatchHistory(user?.username);

  if (!user) {
    return null;
  }

  const { stats } = user;
  const rankLabel = stats.rank > 0 ? `Rank #${stats.rank}` : 'Unranked player';

  return (
    <div className="page profile-page">
      <PageHeader
        eyebrow="Player profile"
        title="Your player card"
        description="Profile details, career numbers and a full record of recent matches."
        actions={
          <Badge tone={stats.rank > 0 ? 'accent' : 'neutral'}>
            {rankLabel}
          </Badge>
        }
      />

      <Card className="profile-hero">
        <div className="profile-identity">
          <Avatar
            name={user.fullName}
            accent={user.accent}
            size="xl"
            className="profile-avatar"
          />
          <div className="profile-copy">
            <div className="profile-name-row">
              <h2>{user.fullName}</h2>
              <Badge tone="neutral">@{user.username}</Badge>
            </div>
            <div className="profile-meta">
              <span>
                <MapPinIcon />
                {user.location}
              </span>
              <span>
                <CalendarIcon />
                Joined {formatMonthYear(user.joinedAt)}
              </span>
              <span>
                <MailIcon />
                {user.email}
              </span>
            </div>
            <p className="profile-bio">{user.bio}</p>
          </div>
        </div>

        <div className="profile-quick-stats">
          <div>
            <span>Matches</span>
            <strong>{formatNumber(stats.matches)}</strong>
          </div>
          <div>
            <span>Wins</span>
            <strong>{formatNumber(stats.wins)}</strong>
          </div>
          <div>
            <span>Win rate</span>
            <strong>{stats.winRate}%</strong>
          </div>
          <div>
            <span>Points</span>
            <strong>{formatNumber(stats.points)}</strong>
          </div>
        </div>
      </Card>

      <div className="profile-grid">
        <Card className="panel-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Career snapshot</p>
              <h2>Statistics</h2>
            </div>
            <Badge tone="accent">{stats.winRate}% win rate</Badge>
          </div>

          <div className="career-grid">
            <div className="career-stat">
              <span>Total matches</span>
              <strong>{formatNumber(stats.matches)}</strong>
            </div>
            <div className="career-stat">
              <span>Wins</span>
              <strong>{formatNumber(stats.wins)}</strong>
            </div>
            <div className="career-stat">
              <span>Losses</span>
              <strong>{formatNumber(stats.losses)}</strong>
            </div>
            <div className="career-stat">
              <span>Ranking points</span>
              <strong>{formatNumber(stats.points)}</strong>
            </div>
            <div className="career-stat">
              <span>Average points</span>
              <strong>{stats.averagePoints}</strong>
            </div>
            <div className="career-stat">
              <span>Tournaments won</span>
              <strong>{stats.tournamentsWon}</strong>
            </div>
          </div>

          <div className="career-progress">
            <div className="career-progress-head">
              <span>Win rate</span>
              <strong>{stats.winRate}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={stats.winRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Win rate"
            >
              <span style={{ width: `${stats.winRate}%` }} />
            </div>
          </div>
        </Card>

        <Card className="panel-card">
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
            <li>
              <span className="best-icon">
                <ZapIcon />
              </span>
              <div>
                <span>Ranking points</span>
                <strong>{formatNumber(stats.points)}</strong>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="panel-card history-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Match log</p>
            <h2>Match history</h2>
          </div>
          <Badge tone="neutral">
            {history.length} {history.length === 1 ? 'match' : 'matches'}
          </Badge>
        </div>

        {historyError ? (
          <div className="empty-state">
            <span className="empty-icon">
              <BallIcon />
            </span>
            <h3>Match history unavailable</h3>
            <p role="alert">{historyError}</p>
          </div>
        ) : history.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table profile-table">
              <thead>
                <tr>
                  <th scope="col">Opponent</th>
                  <th scope="col">Result</th>
                  <th scope="col">Score</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((match, index) => {
                  const won = match.result === 'win';

                  return (
                    <tr key={match.id}>
                      <td>
                        <span className="table-player">
                          <Avatar
                            name={match.opponent}
                            accent={
                              opponentAccents[index % opponentAccents.length]
                            }
                            size="sm"
                          />
                          {match.opponent}
                        </span>
                      </td>
                      <td>
                        <Badge tone={won ? 'success' : 'danger'}>
                          {won ? 'Win' : 'Loss'}
                        </Badge>
                      </td>
                      <td className="table-score">
                        {match.playerScore} – {match.opponentScore}
                      </td>
                      <td>{match.mode}</td>
                      <td>{formatShortDate(match.playedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <BallIcon />
            </span>
            <h3>No matches recorded</h3>
            <p>Play your first match to start building a match history.</p>
            <Button size="sm" onClick={() => navigate('game')}>
              Play a match
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ProfilePage;
