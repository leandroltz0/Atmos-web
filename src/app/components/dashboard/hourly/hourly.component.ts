import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

import { WeatherIconComponent } from '../../../shared/components/weather-icon/weather-icon.component';
import { HourlyForecast } from '../../../features/dashboard/mock-weather.data';

@Component({
  selector: 'app-dashboard-hourly',
  standalone: true,
  imports: [MatRippleModule, WeatherIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hourly.component.html',
  styleUrl: './hourly.component.scss'
})
export class DashboardHourlyComponent {
  readonly hourlyForecast = input.required<HourlyForecast[]>();

  readonly goToDetail = output<void>();

  protected trackByHour(_index: number, item: HourlyForecast): string {
    return item.hour;
  }

  protected onGoToDetail(): void {
    this.goToDetail.emit();
  }
}
