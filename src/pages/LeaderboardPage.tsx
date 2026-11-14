import { useEffect, useState } from 'react';
import { TrophyIcon } from '../components/icons';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { buildLeaderboard, type GameRow } from '../lib/leaderboard';
import { formatNumber } from '../lib/format';
import { supabase } from '../lib/supabase';
import type { LeaderboardPlayer } from '../types';

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
  const [entries, setEntries] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const username = user?.username ?? '';

  useEffect(() => {
    if (!username) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('username, score');

        if (!active) {
          return;
        }

        if (fetchError) {
          setError('The leaderboard could not be loaded.');
          return;
        }

        setEntries(
          buildLeaderboard((data as GameRow[] | null) ?? [], username),
        );
      } catch {
        if (active) {
          setError('The leaderboard could not be loaded.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [username, reloadKey]);

  if (!user) {
    return null;
  }

  const retry = () => {
    setIsLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  };

  const topThree = entries.slice(0, 3);

  let content;

  if (isLoading) {
    content = (
      <Card className="panel-card">
        <div className="empty-state" role="status">
          <span className="empty-icon">
            <TrophyIcon />
          </span>
          <h3>Loading leaderboard...</h3>
          <p>Fetching the latest results.</p>
        </div>
      </Card>
    );
  } else if (error) {
    content = (
      <Card className="panel-card">
        <div className="empty-state">
          <span className="empty-icon">
            <TrophyIcon />
          </span>
          <h3>Leaderboard unavailable</h3>
          <p role="alert">{error}</p>
          <Button size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      </Card>
    );
  } else if (entries.length === 0) {
    content = (
      <Card className="panel-card">
        <div className="empty-state">
          <span className="empty-icon">
            <TrophyIcon />
          </span>
          <h3>No games played yet</h3>
          <p>Finish a match to appear on the global leaderboard.</p>
        </div>
      </Card>
    );
  } else {
    content = (
      <>
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
      </>
    );
  }

  return (
    <div className="page leaderboard-page">
      <PageHeader
        eyebrow="Global rankings"
        title="Leaderboard"
        description="The players setting the pace this season, ranked by ranking points."
        actions={<Badge tone="accent">Season 4</Badge>}
      />

      {content}
    </div>
  );
}

export default LeaderboardPage;
