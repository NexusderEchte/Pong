import { useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useRoute } from './hooks/useRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

const PAGES: Record<string, () => ReactNode> = {
  login: LoginPage,
  register: RegisterPage,
  dashboard: DashboardPage,
  game: GamePage,
  profile: ProfilePage,
  leaderboard: LeaderboardPage,
};

const AUTH_PAGES = ['login', 'register'];

function AppRouter() {
  const { route, navigate } = useRoute();
  const { isAuthenticated } = useAuth();

  // Auth guard: keep the URL in sync with the authentication state.
  // window.location.hash is used here (instead of setState) so that the
  // subsequent hashchange updates route through the hook's listener.
  useEffect(() => {
    const current = route ?? 'dashboard';
    const isAuthPage = AUTH_PAGES.includes(current);

    if (!isAuthenticated && !isAuthPage) {
      window.location.hash = '#/login';
      return;
    }
    if (isAuthenticated && isAuthPage) {
      window.location.hash = '#/dashboard';
    }
  }, [isAuthenticated, route]);

  const Page = PAGES[route ?? 'dashboard'];

  if (!Page) {
    navigate('dashboard');
    return null;
  }

  return <Page />;
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <AppRouter />
      </Layout>
    </AuthProvider>
  );
}

export default App;
