export const appRoutes = [
  'login',
  'register',
  'dashboard',
  'game',
  'profile',
  'leaderboard',
] as const;

export type AppRoute = (typeof appRoutes)[number];

export const defaultRoute: AppRoute = 'login';

export const authRoutes: AppRoute[] = ['login', 'register'];

export function isAuthRoute(route: AppRoute): boolean {
  return authRoutes.includes(route);
}

export function parseHash(): AppRoute {
  const value = window.location.hash
    .replace(/^#\/?/, '')
    .split('?')[0]
    .toLowerCase();

  return appRoutes.includes(value as AppRoute)
    ? (value as AppRoute)
    : defaultRoute;
}

export function routeToHash(route: AppRoute): string {
  return `#/${route}`;
}
