import { TrophyIcon } from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { leaderboardPlayers } from '../data/mockData';
import { formatNumber } from '../lib/format';

const playerAccents = [
  '#ffc857',
  '#c7d2dc',
  '#d98b5f',
  '#22e6a6',
  '#4da3ff',
  '#ff6b7a',
  '#b18cff',
  '#5fd4c8',
  '#f08fb2',
  '#9ad16b',
];

function LeaderboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const entries = leaderboardPlayers.map((player) => ({
    ...player,
    isCurrentUser: player.id === user.id,
  }));

  if (!entries.some((player) => player.id === user.id)) {
    entries.push({
      id: user.id,
      username: user.username,
      wins: user.stats.wins,
      losses: user.stats.losses,
      points: user.stats.points,
      isCurrentUser: true,
    });
  }

  entries.sort((a, b) => b.points - a.points);
  const topThree = entries.slice(0, 3);

  return (
    <div className="page leaderboard-page">
      <PageHeader
        eyebrow="Global rankings"
        title="Leaderboard"
        description="The players setting the pace this season, ranked by ranking points."
        actions={<Badge tone="accent">Season 4</Badge>}
      />

      <section className="podium-grid" aria-label="Top three players">
        {topThree.map((player, index) => (
          <Card
            key={player.id}
            className={`podium-card podium-${index + 1} ${
              player.isCurrentUser ? 'is-current' : ''
            }`.trim()}
          >
            <div className="podium-top">
              <span className={`podium-rank rank-${index + 1}`}>
                <TrophyIcon />#{index + 1}
              </span>
              <Badge tone={index === 0 ? 'warning' : 'neutral'}>
                {index === 0
                  ? 'Champion'
                  : index === 1
                    ? 'Runner-up'
                    : 'Third place'}
              </Badge>
            </div>

            <Avatar
              name={player.username}
              accent={playerAccents[index % playerAccents.length]}
              size="lg"
              className="podium-avatar"
            />

            <div className="podium-copy">
              <h2>{player.username}</h2>
              {player.isCurrentUser ? <Badge tone="accent">You</Badge> : null}
            </div>

            <p className="podium-points">
              {formatNumber(player.points)}
              <span>pts</span>
            </p>

            <div className="podium-meta">
              <span>{player.wins} wins</span>
              <span>{player.losses} losses</span>
            </div>
          </Card>
        ))}
      </section>

      <Card className="panel-card leaderboard-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Season standings</p>
            <h2>All players</h2>
          </div>
          <Badge tone="neutral">{entries.length} players</Badge>
        </div>

        <div className="table-wrap">
          <table
            className="data-table leaderboard-table"
            aria-label="Global leaderboard"
          >
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">Wins</th>
                <th scope="col">Losses</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((player, index) => {
                const rank = index + 1;
                const rowClasses = [
                  rank <= 3 ? 'is-top-three' : '',
                  player.isCurrentUser ? 'is-current-user' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr key={player.id} className={rowClasses || undefined}>
                    <td>
                      <span
                        className={`rank-pill ${
                          rank <= 3 ? `rank-${rank}` : ''
                        }`.trim()}
                      >
                        {rank}
                      </span>
                    </td>
                    <td>
                      <span className="table-player">
                        <Avatar
                          name={player.username}
                          accent={playerAccents[index % playerAccents.length]}
                          size="sm"
                        />
                        {player.username}
                        {player.isCurrentUser ? (
                          <Badge tone="accent">You</Badge>
                        ) : null}
                      </span>
                    </td>
                    <td>{player.wins}</td>
                    <td>{player.losses}</td>
                    <td className="table-points">
                      {formatNumber(player.points)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default LeaderboardPage;
