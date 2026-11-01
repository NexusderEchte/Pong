import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { Icon } from './icons';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const HIGHLIGHTS = [
  'Track wins, losses and personal bests',
  'Climb the global leaderboard',
  'Jump straight into a quick match',
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <div className="auth-brand-top">
          <Logo size="lg" />
          <div>
            <p className="eyebrow">Serve. Rally. Win.</p>
            <h1>Ping Pong</h1>
            <p className="auth-brand-lead">
              A modern table tennis arena built for friendly rivalries and
              serious bragging rights.
            </p>
          </div>
        </div>

        <div className="auth-brand-copy">
          <p className="auth-brand-label">Everything you need to compete</p>
          <ul className="auth-highlights">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight}>
                <span className="auth-highlight-icon">
                  <Icon name="check" size={14} />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-foot">
          Visual prototype · Mock data only · No backend required
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <p className="eyebrow">Player access</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="card auth-form-card">{children}</div>
          <div className="auth-switch">{footer}</div>
        </div>
      </section>
    </div>
  );
}
