import { useCallback, useEffect, useState } from 'react';
import type { AppRoute } from '../types';

const ROUTES: AppRoute[] = [
  'login',
  'register',
  'dashboard',
  'game',
  'profile',
  'leaderboard',
];

function parseRoute(hash: string): AppRoute {
  const value = hash.replace(/^#\/?/, '');
  const route = ROUTES.find((candidate) => candidate === value);

  return route ?? 'login';
}

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseRoute(window.location.hash),
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = useCallback(
    (nextRoute: AppRoute, options?: { replace?: boolean }) => {
      const target = `#/${nextRoute}`;

      if (window.location.hash === target) {
        setRoute(nextRoute);
        return;
      }

      if (options?.replace) {
        window.history.replaceState(null, '', target);
      } else {
        window.location.hash = target;
      }

      setRoute(nextRoute);
    },
    [],
  );

  return { route, navigate };
}
