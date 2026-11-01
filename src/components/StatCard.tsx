import { classNames } from '../lib/classNames';
import { Icon, type IconName } from './icons';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: IconName;
  tone?: 'accent' | 'success' | 'danger' | 'neutral';
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = 'accent',
}: StatCardProps) {
  return (
    <article className={classNames('stat-card', `stat-card--${tone}`)}>
      <div className="stat-card-top">
        <span className="stat-icon">
          <Icon name={icon} size={18} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </article>
  );
}
