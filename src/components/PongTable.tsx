import { classNames } from '../lib/classNames';

interface PongTableProps {
  playing: boolean;
  leftName: string;
  rightName: string;
}

export function PongTable({ playing, leftName, rightName }: PongTableProps) {
  return (
    <div
      aria-label="Ping Pong table preview"
      className={classNames('pong-table', playing && 'pong-table--playing')}
      role="img"
    >
      <div className="pong-table-net" />
      <span className="pong-name pong-name--left">{leftName}</span>
      <span className="pong-name pong-name--right">{rightName}</span>
      <span className="pong-paddle pong-paddle--left" />
      <span className="pong-paddle pong-paddle--right" />
      <span className="pong-ball" />
    </div>
  );
}
