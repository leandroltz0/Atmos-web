import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'detail'
  },
  {
    path: 'allow-location',
    loadComponent: () => import('./pages/allow-location/allow-location.page').then((m) => m.AllowLocationPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'detail',
    loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then((m) => m.OnboardingPage)
  }
];
