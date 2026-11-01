import { Avatar } from './Avatar';
import { Button } from './Button';

interface ScoreBoardProps {
  leftName: string;
  rightName: string;
  leftScore: number;
  rightScore: number;
  leftLabel?: string;
  rightLabel?: string;
  onLeftPoint?: () => void;
  onRightPoint?: () => void;
}

export function ScoreBoard({
  leftName,
  rightName,
  leftScore,
  rightScore,
  leftLabel = 'Player 1',
  rightLabel = 'Player 2',
  onLeftPoint,
  onRightPoint,
}: ScoreBoardProps) {
  return (
    <div className="scoreboard-wrap">
      <div className="scoreboard">
        <div className="score-side">
          <Avatar name={leftName} size="md" />
          <span className="score-info">
            <strong className="score-player-name">{leftName}</strong>
            <span className="score-player-label">{leftLabel}</span>
          </span>
        </div>

        <strong aria-label={`${leftName} score`} className="score-value">
          {leftScore}
        </strong>
        <span aria-hidden="true" className="score-separator">
          :
        </span>
        <strong aria-label={`${rightName} score`} className="score-value">
          {rightScore}
        </strong>

        <div className="score-side score-side--right">
          <span className="score-info">
            <strong className="score-player-name">{rightName}</strong>
            <span className="score-player-label">{rightLabel}</span>
          </span>
          <Avatar name={rightName} size="md" />
        </div>
      </div>

      {(onLeftPoint || onRightPoint) && (
        <div className="score-controls">
          <Button onClick={onLeftPoint} size="sm" variant="secondary">
            +1 {leftName}
          </Button>
          <Button onClick={onRightPoint} size="sm" variant="secondary">
            +1 {rightName}
          </Button>
        </div>
      )}
    </div>
  );
}
