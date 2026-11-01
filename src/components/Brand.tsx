import { BallIcon } from './icons';

export interface BrandProps {
  onClick?: () => void;
  className?: string;
}

export function Brand({ onClick, className = '' }: BrandProps) {
  const content = (
    <>
      <span className="brand-mark">
        <BallIcon />
      </span>
      <span className="brand-name">Ping Pong</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`brand ${className}`.trim()}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={`brand ${className}`.trim()}>{content}</div>;
}
