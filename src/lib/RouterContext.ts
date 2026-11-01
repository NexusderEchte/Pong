import { createContext, useContext } from 'react';
import type { AppRoute } from './routes';

export interface RouterContextValue {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
}

export const RouterContext = createContext<RouterContextValue | null>(null);

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('useRouter must be used inside a RouterProvider');
  }

  return context;
}
