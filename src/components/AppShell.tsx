import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../lib/RouterContext';
import type { AppRoute } from '../lib/routes';
import { Avatar } from './ui/Avatar';
import { Brand } from './Brand';
import { BallIcon, GridIcon, LogOutIcon, TrophyIcon, UserIcon } from './icons';

interface NavigationItem {
  route: AppRoute;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: GridIcon },
  { route: 'game', label: 'Play', icon: BallIcon },
  { route: 'profile', label: 'Profile', icon: UserIcon },
  { route: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { route, navigate } = useRouter();

  if (!user) {
    return null;
  }

  const rankLabel =
    user.stats.rank > 0 ? `Rank #${user.stats.rank}` : 'Unranked';

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className="sidebar">
        <Brand onClick={() => navigate('dashboard')} />

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = route === item.route;

            return (
              <button
                key={item.route}
                type="button"
                className={`nav-link ${active ? 'is-active' : ''}`.trim()}
                onClick={() => navigate(item.route)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="user-chip"
            onClick={() => navigate('profile')}
            aria-label={`Open ${user.username}'s profile`}
          >
            <Avatar name={user.username} accent={user.accent} size="sm" />
            <span className="user-chip-copy">
              <strong>{user.username}</strong>
              <span>{rankLabel}</span>
            </span>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOutIcon />
          </button>
        </div>
      </aside>

      <div className="app-body">
        <header className="mobile-header">
          <Brand onClick={() => navigate('dashboard')} />
          <div className="mobile-header-actions">
            <Avatar name={user.username} accent={user.accent} size="sm" />
            <button
              type="button"
              className="icon-button"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOutIcon />
            </button>
          </div>
        </header>

        <main className="app-main" id="main-content">
          {children}
        </main>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = route === item.route;

            return (
              <button
                key={item.route}
                type="button"
                className={`mobile-nav-link ${active ? 'is-active' : ''}`.trim()}
                onClick={() => navigate(item.route)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
