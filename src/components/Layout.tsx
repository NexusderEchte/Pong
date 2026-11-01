import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <nav className="nav">
        <span className="nav-brand">Ping Pong</span>
        <div className="nav-links">
          <a href="#/dashboard" className="nav-link">
            Dashboard
          </a>
          <a href="#/game" className="nav-link">
            Spiel
          </a>
          <a href="#/profile" className="nav-link">
            Profil
          </a>
          <a href="#/leaderboard" className="nav-link">
            Rangliste
          </a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span
                className="nav-link"
                style={{
                  cursor: 'default',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                }}
              >
                {user.username}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <a href="#/login" className="nav-link">
                Anmelden
              </a>
              <a href="#/register" className="nav-link btn btn-outline btn-sm">
                Registrieren
              </a>
            </>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
