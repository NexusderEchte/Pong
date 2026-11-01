import type { HTMLAttributes } from 'react';

export type BadgeTone = 'accent' | 'success' | 'danger' | 'neutral' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({
  tone = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={`badge badge-${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
