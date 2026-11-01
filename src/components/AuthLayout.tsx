import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { SparklesIcon, TargetIcon, TrophyIcon } from './icons';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <Brand className="auth-brand" />

        <div className="auth-copy">
          <p className="eyebrow">Table tennis, tracked</p>
          <h1>Ping Pong</h1>
          <p className="auth-tagline">
            Every rally, every result. One place to own the table.
          </p>
        </div>

        <ul className="auth-features">
          <li>
            <span className="auth-feature-icon">
              <TrophyIcon />
            </span>
            <div>
              <strong>Climb the ranks</strong>
              <p>Track points, wins and your place on the global board.</p>
            </div>
          </li>
          <li>
            <span className="auth-feature-icon">
              <TargetIcon />
            </span>
            <div>
              <strong>Read every match</strong>
              <p>Keep a clean history of scores, rivals and best results.</p>
            </div>
          </li>
          <li>
            <span className="auth-feature-icon">
              <SparklesIcon />
            </span>
            <div>
              <strong>Find your edge</strong>
              <p>Spot streaks and personal bests as your game grows.</p>
            </div>
          </li>
        </ul>

        <div className="auth-court" aria-hidden="true">
          <span className="auth-court-line" />
          <span className="auth-court-ball" />
          <span className="auth-paddle auth-paddle-left" />
          <span className="auth-paddle auth-paddle-right" />
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">{children}</div>
        <p className="auth-note">UI prototype · Mock data only</p>
      </section>
    </div>
  );
}
