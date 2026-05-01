import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "**",
    redirectTo: "allow-location"
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then(m => m.OnboardingPage)
  },
  {
    path: 'allow-location',
    loadComponent: () => import('./pages/allow-location/allow-location.page').then(m => m.AllowLocationPage)
  }
];
