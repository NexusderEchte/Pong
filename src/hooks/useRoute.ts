import { useState, useEffect, useCallback } from 'react';

type Route =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'game'
  | 'profile'
  | 'leaderboard'
  | null;

const PUBLIC_ROUTES: Route[] = ['login', 'register'];

const ROUTE_MAP: Record<string, Route> = {
  login: 'login',
  register: 'register',
  dashboard: 'dashboard',
  game: 'game',
  profile: 'profile',
  leaderboard: 'leaderboard',
};

const hashToRoute = (): Route => {
  const hash = window.location.hash.replace('#/', '');
  return ROUTE_MAP[hash] ?? null;
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === 'undefined') return null;
    return hashToRoute();
  });

  useEffect(() => {
    const onHashChange = () => setRoute(hashToRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: Route) => {
    if (to === null) {
      window.location.hash = '#/dashboard';
      setRoute('dashboard');
      return;
    }
    window.location.hash = `#/${to}`;
    setRoute(to);
  }, []);

  const requiresAuth = route !== null && !PUBLIC_ROUTES.includes(route);

  return { route, navigate, requiresAuth };
}

export { ROUTE_MAP };
export type { Route };
