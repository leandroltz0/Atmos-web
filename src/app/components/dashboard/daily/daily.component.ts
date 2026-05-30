import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

import { WeatherIconComponent } from '../../../shared/components/weather-icon/weather-icon.component';
import { DailyForecast } from '../../../features/dashboard/mock-weather.data';

@Component({
  selector: 'app-dashboard-daily',
  standalone: true,
  imports: [MatRippleModule, WeatherIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.scss'
})
export class DashboardDailyComponent {
  readonly dailyForecast = input.required<DailyForecast[]>();
  readonly tempRange = input.required<{ min: number; max: number }>();

  readonly goToDetail = output<void>();

  protected trackByDate(_index: number, item: DailyForecast): string {
    return item.date;
  }

  protected getTempBarWidth(day: DailyForecast): number {
    const { min, max } = this.tempRange();
    const total = Math.max(max - min, 1);
    return ((day.tempMax - day.tempMin) / total) * 100;
  }

  protected getTempBarOffset(day: DailyForecast): number {
    const { min, max } = this.tempRange();
    const total = Math.max(max - min, 1);
    return ((day.tempMin - min) / total) * 100;
  }

  protected onGoToDetail(): void {
    this.goToDetail.emit();
  }
}
