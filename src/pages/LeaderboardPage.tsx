import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/icons';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/auth-context';
import { mockLeaderboard } from '../data/mockData';
import { classNames } from '../lib/classNames';

function LeaderboardPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const rankedPlayers = [...mockLeaderboard]
    .map((player) =>
      player.id === 'current'
        ? { ...player, username: user?.displayName ?? player.username }
        : player,
    )
    .sort((left, right) => right.points - left.points)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const topThree = rankedPlayers.slice(0, 3);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlayers = rankedPlayers.filter((player) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      player.username.toLowerCase().includes(normalizedQuery) ||
      player.country.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Global ranking"
        subtitle="Every rally counts. These are the players setting the pace this season."
        title="Leaderboard"
      />

      <section className="podium" aria-label="Top three players">
        {topThree.map((player) => (
          <article
            className={classNames(
              'podium-card',
              `podium-card--rank-${player.rank}`,
              player.id === 'current' && 'podium-card--current',
            )}
            key={player.id}
          >
            <div className="podium-top">
              <span className="podium-rank">
                {player.rank === 1 ? (
                  <Icon name="trophy" size={24} />
                ) : (
                  `#${player.rank}`
                )}
              </span>
              <span className="badge badge--muted">{player.country}</span>
            </div>
            <Avatar
              className="podium-avatar"
              name={player.username}
              size="lg"
            />
            <h2>{player.username}</h2>
            <p>{player.points.toLocaleString('en')} points</p>
            <div className="podium-stats">
              <span>
                <strong>{player.wins}</strong> wins
              </span>
              <span>
                <strong>{player.streak}</strong> streak
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="card table-card">
        <div className="card-heading table-heading">
          <div>
            <p className="eyebrow">All players</p>
            <h2>Season standings</h2>
          </div>
          <div className="search-field">
            <Icon name="search" size={17} />
            <input
              aria-label="Search players"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search player or country"
              type="search"
              value={query}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">Wins</th>
                <th scope="col">Losses</th>
                <th scope="col">Points</th>
                <th scope="col">Streak</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr
                  className={classNames(
                    player.rank <= 3 && 'leaderboard-row--top',
                    player.id === 'current' && 'leaderboard-row--current',
                  )}
                  key={player.id}
                >
                  <td>
                    <span
                      className={classNames(
                        'rank-badge',
                        player.rank <= 3 && 'rank-badge--top',
                      )}
                    >
                      {player.rank}
                    </span>
                  </td>
                  <td>
                    <div className="player-cell">
                      <Avatar name={player.username} size="sm" />
                      <span className="player-cell-copy">
                        <strong>{player.username}</strong>
                        <span>{player.country}</span>
                      </span>
                      {player.id === 'current' && (
                        <span className="badge badge--accent">You</span>
                      )}
                    </div>
                  </td>
                  <td>{player.wins}</td>
                  <td>{player.losses}</td>
                  <td>
                    <strong>{player.points.toLocaleString('en')}</strong>
                  </td>
                  <td>{player.streak}</td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Icon name="search" size={22} />
                      <strong>No players found</strong>
                      <span>Try a different name or country code.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default LeaderboardPage;
