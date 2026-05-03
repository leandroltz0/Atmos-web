import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { WeeklyHeaderComponent } from './components/weekly-header/weekly-header.component';
import { WeeklyItemComponent } from './components/weekly-item/weekly-item.component';

export interface WeeklyForecastItem {
  day: string;
  icon: string;
  min: number;
  max: number;
  rain: number;
}

@Component({
  selector: 'app-weekly-tab',
  standalone: true,
  imports: [WeeklyHeaderComponent, WeeklyItemComponent],
  templateUrl: './weekly-tab.component.html',
  styleUrl: './weekly-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyTabComponent {
  @Input() showHeader = true;
  @Input() emptyStateText = 'No forecast available for this week.';
  @Input() weeklyData: WeeklyForecastItem[] = [];

  get forecastDays(): WeeklyForecastItem[] {
    return this.weeklyData.slice(0, 7);
  }
}
