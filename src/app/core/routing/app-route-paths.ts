export const APP_ROUTE_PATHS = {
  favorites: 'favorites',
  detail: 'detail',
  onboarding: 'onboarding',
  allowLocation: 'allow-location',
  home: 'home',
  dashboard: 'dashboard',
  search: 'search',
  settings: 'settings'
} as const;

export const DEFAULT_APP_ROUTE = APP_ROUTE_PATHS.favorites;
