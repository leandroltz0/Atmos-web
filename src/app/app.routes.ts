import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
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
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then((m) => m.OnboardingPage)
  }
];
