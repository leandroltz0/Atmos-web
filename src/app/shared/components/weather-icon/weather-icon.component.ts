import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  template: `
    <img
      [src]="iconPath()"
      [alt]="altText()"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [style.width.px]="size()"
      [style.height.px]="size()"
      class="weather-icon"
    />
  `,
  styles: `
    .weather-icon {
      display: block;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherIconComponent {
  readonly condition = input.required<string>();
  readonly size = input<number>(64);
  readonly decorative = input(false);

  private readonly iconMap: Record<string, string> = {
    sunny: 'sun',
    'clear-night': 'moon',
    'partly-cloudy': 'partly-cloudy-day',
    cloudy: 'cloudy',
    overcast: 'overcast',
    rainy: 'rain',
    drizzle: 'drizzle',
    stormy: 'thunderstorms-rain',
    snowy: 'snow',
    foggy: 'fog'
  };

  protected readonly iconPath = computed(() => {
    const icon = this.iconMap[this.condition()] ?? 'cloudy';
    return `/assets/icons/weather/${icon}.svg`;
  });

  protected readonly altText = computed(() => this.decorative() ? '' : `${this.condition()} weather icon`);
}
