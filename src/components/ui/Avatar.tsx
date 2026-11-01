export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  accent?: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function Avatar({
  name,
  accent = '#22e6a6',
  size = 'md',
  className = '',
}: AvatarProps) {
  return (
    <span
      className={`avatar avatar-${size} ${className}`.trim()}
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
