export const APP_ROUTE_PATHS = {
  auth: 'auth',
  favorites: 'favorites',
  detail: 'detail',
  onboarding: 'onboarding',
  allowLocation: 'allow-location',
  home: 'home',
  dashboard: 'dashboard',
  search: 'search',
  settings: 'settings',
  profile: 'profile'
} as const;

export const DEFAULT_APP_ROUTE = APP_ROUTE_PATHS.favorites;
