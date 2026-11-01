import type { ReactNode } from 'react';
import { Card } from './Card';

export type StatTone = 'accent' | 'blue' | 'danger' | 'warning';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone?: StatTone;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'accent',
}: StatCardProps) {
  return (
    <Card className={`stat-card stat-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint ? <span className="stat-hint">{hint}</span> : null}
      </div>
    </Card>
  );
}
