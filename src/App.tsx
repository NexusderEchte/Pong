import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider';
import { useRouter } from './lib/RouterContext';
import { RouterProvider } from './lib/RouterProvider';
import { isAuthRoute, type AppRoute } from './lib/routes';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

const routeTitles: Record<AppRoute, string> = {
  login: 'Sign in',
  register: 'Create account',
  dashboard: 'Dashboard',
  game: 'Play',
  profile: 'Profile',
  leaderboard: 'Leaderboard',
};

function AppView() {
  const { user } = useAuth();
  const { route, navigate } = useRouter();
  const authRoute = isAuthRoute(route);

  useEffect(() => {
    if (!user && !authRoute) {
      navigate('login');
    } else if (user && authRoute) {
      navigate('dashboard');
    }
  }, [user, authRoute, navigate]);

  useEffect(() => {
    document.title = `${routeTitles[route]} · Ping Pong`;
  }, [route]);

  if (!user) {
    return route === 'register' ? <RegisterPage /> : <LoginPage />;
  }

  if (authRoute) {
    return (
      <AppShell>
        <DashboardPage />
      </AppShell>
    );
  }

  if (route === 'game') {
    return (
      <AppShell>
        <GamePage />
      </AppShell>
    );
  }

  if (route === 'profile') {
    return (
      <AppShell>
        <ProfilePage />
      </AppShell>
    );
  }

  if (route === 'leaderboard') {
    return (
      <AppShell>
        <LeaderboardPage />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppView />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
