import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type AuthMode = 'signin' | 'signup';

type PreviewMetric = {
  label: string;
  value: string;
  icon: string;
  badge: string;
  detail: string;
  tone: 'primary' | 'info' | 'sun' | 'success';
  meter: number;
};

type PreviewFeature = {
  label: string;
  tone: 'primary' | 'info' | 'sun';
};

@Component({
  selector: 'app-auth-preview-panel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './auth-preview-panel.component.html',
  styleUrl: './auth-preview-panel.component.scss',
  host: {
    '[class.preview-panel-host--signup]': "mode() === 'signup'"
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPreviewPanelComponent {
  readonly mode = input<AuthMode>('signin');

  protected readonly metrics: PreviewMetric[] = [
    {
      label: 'Favorites synced',
      value: '08 cities',
      icon: 'bookmark',
      badge: 'Synced',
      detail: '2 cities updated in the last hour',
      tone: 'primary',
      meter: 78
    },
    {
      label: 'Rain probability',
      value: '24%',
      icon: 'water_drop',
      badge: 'Low',
      detail: 'Light chance after midnight',
      tone: 'info',
      meter: 24
    },
    {
      label: 'Air quality',
      value: 'AQI 29',
      icon: 'air',
      badge: 'Good',
      detail: 'Comfortable outdoor conditions',
      tone: 'sun',
      meter: 29
    },
    {
      label: 'Wind',
      value: '18 km/h SE',
      icon: 'explore',
      badge: 'SE',
      detail: 'Steady breeze across the evening',
      tone: 'success',
      meter: 58
    }
  ];

  protected readonly features: PreviewFeature[] = [
    { label: 'Cross-device favorites', tone: 'primary' },
    { label: 'Location-aware alerts', tone: 'info' },
    { label: 'Comparison ready', tone: 'sun' }
  ];
}
