import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { SectionCardComponent } from '../section-card';
import { StatCellComponent } from '../stat-cell';
import { UvBadgeComponent, type UvLevel } from '../uv-badge';

export interface TodayHighlight {
  label: string;
  value: string;
  unit?: string;
}

export interface TodayForecastItem {
  hour: string;
  temp: string;
  state: string;
}

@Component({
  selector: 'app-today-tab',
  standalone: true,
  imports: [SectionCardComponent, StatCellComponent, UvBadgeComponent],
  templateUrl: './today-tab.component.html',
  styleUrl: './today-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodayTabComponent {
  @Input() highlights: TodayHighlight[] = [];
  @Input() hourlyForecast: TodayForecastItem[] = [];
  @Input() uvLevel: UvLevel = 'moderate';
  @Input() pressureLabel = '1014 hPa';
  @Input() visibilityLabel = '10 km';
  @Input() rainLabel = '0 mm';
}
