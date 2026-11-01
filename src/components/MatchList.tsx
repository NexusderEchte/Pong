import type { MatchRecord } from '../types';
import { formatShortDate } from '../lib/format';
import { classNames } from '../lib/classNames';

interface MatchListProps {
  matches: MatchRecord[];
  limit?: number;
}

export function MatchList({ matches, limit }: MatchListProps) {
  const visibleMatches =
    typeof limit === 'number' ? matches.slice(0, limit) : matches;

  return (
    <ul className="match-list">
      {visibleMatches.map((match) => (
        <li className="match-row" key={match.id}>
          <span
            className={classNames(
              'match-result',
              `match-result--${match.result}`,
            )}
          >
            {match.result === 'win' ? 'W' : 'L'}
            <span className="sr-only">
              {match.result === 'win' ? 'Win' : 'Loss'}
            </span>
          </span>
          <span className="match-opponent">
            <strong>vs {match.opponent}</strong>
            <span>{formatShortDate(match.playedAt)}</span>
          </span>
          <span className="match-score">
            {match.playerScore} – {match.opponentScore}
          </span>
          <span
            className={classNames(
              'match-points',
              match.points >= 0 ? 'match-points--win' : 'match-points--loss',
            )}
          >
            {match.points >= 0 ? '+' : '−'}
            {Math.abs(match.points)}
          </span>
        </li>
      ))}
    </ul>
  );
}
