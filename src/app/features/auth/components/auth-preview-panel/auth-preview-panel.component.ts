import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type AuthMode = 'signin' | 'signup';

type PreviewMetric = {
  label: string;
  value: string;
};

type PreviewFeature = {
  label: string;
  tone: 'primary' | 'info' | 'sun';
};

@Component({
  selector: 'app-auth-preview-panel',
  standalone: true,
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
    { label: 'Favorites synced', value: '08 cities' },
    { label: 'Rain probability', value: '24%' },
    { label: 'Air quality', value: 'AQI 29' },
    { label: 'Wind', value: '18 km/h SE' }
  ];

  protected readonly features: PreviewFeature[] = [
    { label: 'Cross-device favorites', tone: 'primary' },
    { label: 'Location-aware alerts', tone: 'info' },
    { label: 'Comparison ready', tone: 'sun' }
  ];
}
