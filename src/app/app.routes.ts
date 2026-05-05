import { Routes } from '@angular/router';
import { APP_ROUTE_PATHS, DEFAULT_APP_ROUTE } from './shared/constants/app-routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: DEFAULT_APP_ROUTE
  },
  {
    path: APP_ROUTE_PATHS.detail,
    loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage)
  },
  {
    path: APP_ROUTE_PATHS.allowLocation,
    loadComponent: () => import('./pages/allow-location/allow-location.page').then((m) => m.AllowLocationPage)
  },
  {
    path: APP_ROUTE_PATHS.home,
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: APP_ROUTE_PATHS.dashboard,
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: APP_ROUTE_PATHS.search,
    loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent)
  },
  {
    path: APP_ROUTE_PATHS.onboarding,
    loadComponent: () => import('./pages/onboarding/onboarding.page').then((m) => m.OnboardingPage)
  },
  {
    path: '**',
    redirectTo: APP_ROUTE_PATHS.search
  }
];
