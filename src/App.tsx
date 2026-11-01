import { useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth-context';
import { useHashRoute } from './hooks/useHashRoute';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import type { AppRoute } from './types';

function renderPage(route: AppRoute) {
  switch (route) {
    case 'game':
      return <GamePage />;
    case 'leaderboard':
      return <LeaderboardPage />;
    case 'profile':
      return <ProfilePage />;
    case 'login':
    case 'register':
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
}

function AppContent() {
  const { user } = useAuth();
  const { route, navigate } = useHashRoute();
  const isAuthRoute = route === 'login' || route === 'register';

  const activeRoute: AppRoute = !user
    ? isAuthRoute
      ? route
      : 'login'
    : isAuthRoute
      ? 'dashboard'
      : route;

  useEffect(() => {
    if (activeRoute !== route) {
      navigate(activeRoute, { replace: true });
    }
  }, [activeRoute, route, navigate]);

  if (!user) {
    return activeRoute === 'register' ? <RegisterPage /> : <LoginPage />;
  }

  return (
    <AppLayout onNavigate={navigate} route={activeRoute}>
      {renderPage(activeRoute)}
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
