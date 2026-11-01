import { classNames } from '../lib/classNames';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'P';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getHue(name: string): number {
  return [...name].reduce((total, character) => {
    return (total + character.charCodeAt(0) * 7) % 360;
  }, 0);
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const hue = getHue(name);

  return (
    <span
      aria-hidden="true"
      className={classNames('avatar', `avatar--${size}`, className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 72% 48%), hsl(${(hue + 48) % 360} 68% 34%))`,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
