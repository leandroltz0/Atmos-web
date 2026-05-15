import { Routes } from '@angular/router';
import { APP_ROUTE_PATHS, DEFAULT_APP_ROUTE } from './core/routing/app-route-paths';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: DEFAULT_APP_ROUTE
  },
  {
    path: APP_ROUTE_PATHS.detail,
    loadComponent: () => import('./features/detail/detail.page').then((m) => m.DetailPage)
  },
  {
    path: APP_ROUTE_PATHS.allowLocation,
    loadComponent: () => import('./features/allow-location/allow-location.page').then((m) => m.AllowLocationPage)
  },
  {
    path: APP_ROUTE_PATHS.home,
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: APP_ROUTE_PATHS.dashboard,
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: APP_ROUTE_PATHS.search,
    loadComponent: () => import('./features/search/search.page').then((m) => m.SearchPage)
  },
  {
    path: APP_ROUTE_PATHS.onboarding,
    loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPage)
  },
  {
    path: '**',
    redirectTo: APP_ROUTE_PATHS.search
  }
];
