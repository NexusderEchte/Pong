import { useState, type ReactNode } from 'react';
import type { AppRoute } from '../types';
import { classNames } from '../lib/classNames';
import { useAuth } from '../context/auth-context';
import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { Icon, type IconName } from './icons';

interface AppLayoutProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: ReactNode;
}

interface NavItem {
  route: AppRoute;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'game', label: 'Play', icon: 'game' },
  { route: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { route: 'profile', label: 'Profile', icon: 'profile' },
];

const PAGE_TITLES: Record<AppRoute, string> = {
  login: 'Sign in',
  register: 'Create account',
  dashboard: 'Dashboard',
  game: 'Quick match',
  leaderboard: 'Leaderboard',
  profile: 'Player profile',
};

export function AppLayout({ route, onNavigate, children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (nextRoute: AppRoute) => {
    onNavigate(nextRoute);
    setIsMenuOpen(false);
  };

  return (
    <div className="app-shell">
      {isMenuOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-overlay"
          onClick={() => setIsMenuOpen(false)}
          type="button"
        />
      )}

      <aside
        className={classNames('sidebar', isMenuOpen && 'sidebar--open')}
        id="main-navigation"
      >
        <div className="sidebar-brand">
          <Logo />
          <span className="prototype-pill">Prototype</span>
        </div>

        <nav aria-label="Main navigation" className="sidebar-nav">
          <p className="sidebar-label">Menu</p>
          {NAV_ITEMS.map((item) => (
            <button
              aria-current={route === item.route ? 'page' : undefined}
              className={classNames(
                'nav-link',
                route === item.route && 'nav-link--active',
              )}
              key={item.route}
              onClick={() => handleNavigate(item.route)}
              type="button"
            >
              <span className="nav-icon">
                <Icon name={item.icon} size={19} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name={user?.displayName ?? 'Player'} size="sm" />
            <span className="sidebar-user-info">
              <strong>{user?.displayName ?? 'Player'}</strong>
              <span>{user?.email ?? 'demo@pingpong.dev'}</span>
            </span>
          </div>
          <button className="logout-button" onClick={logout} type="button">
            <Icon name="logout" size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              aria-controls="main-navigation"
              aria-expanded={isMenuOpen}
              aria-label="Open navigation"
              className="menu-button"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <Icon name="menu" size={21} />
            </button>
            <span className="mobile-brand">
              <Logo size="sm" />
            </span>
            <div className="topbar-heading">
              <span>Ping Pong</span>
              <strong>{PAGE_TITLES[route]}</strong>
            </div>
          </div>
          <div className="topbar-user">
            <span className="topbar-user-copy">
              <span>Signed in as</span>
              <strong>{user?.displayName ?? 'Player'}</strong>
            </span>
            <Avatar name={user?.displayName ?? 'Player'} size="sm" />
          </div>
        </header>

        <main className="page">{children}</main>
      </div>
    </div>
  );
}
