import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then(m => m.OnboardingPage)
  },
  {
    path: 'allow-location',
    loadComponent: () => import('./pages/allow-location/allow-location.page').then(m => m.AllowLocationPage)
  },
  {
    path: '**',
    redirectTo: 'onboarding'
  }
];
