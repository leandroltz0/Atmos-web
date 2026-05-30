import { ChangeDetectionStrategy, Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

import { WeatherIconComponent } from '../../../shared/components/weather-icon/weather-icon.component';
import { CurrentWeather } from '../../../features/dashboard/mock-weather.data';

@Component({
  selector: 'app-dashboard-hero-card',
  standalone: true,
  imports: [MatRippleModule, WeatherIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-card.component.html',
  styleUrl: './hero-card.component.scss'
})
export class DashboardHeroCardComponent {
  readonly currentWeather = input.required<CurrentWeather>();
  readonly weatherIconSize = input<number>(88);

  readonly goToDetail = output<void>();

  @ViewChild('heroTemp', { read: ElementRef })
  readonly heroTemp!: ElementRef<HTMLElement>;

  protected onGoToDetail(): void {
    this.goToDetail.emit();
  }
}
