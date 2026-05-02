import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AqiDotComponent } from '../../shared/components/aqi-dot';
import { SectionCardComponent } from '../../shared/components/section-card';
import { StatCellComponent } from '../../shared/components/stat-cell';
import { UvBadgeComponent } from '../../shared/components/uv-badge';
import { WeatherTabsComponent } from '../../shared/components/weather-tabs';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, SectionCardComponent, WeatherTabsComponent, UvBadgeComponent, AqiDotComponent, StatCellComponent],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailPage {
  protected readonly highlights = [
    { label: 'Sensacion termica', value: '29°' },
    { label: 'Humedad', value: '64%' },
    { label: 'Viento', value: '18', unit: 'km/h' }
  ];

  protected readonly hourlyForecast = [
    { hour: '14:00', temp: '27°', state: 'Parcialmente nublado' },
    { hour: '15:00', temp: '28°', state: 'Brisa suave' },
    { hour: '16:00', temp: '26°', state: 'Prob. de lluvia 20%' },
    { hour: '17:00', temp: '24°', state: 'Cielo cubierto' }
  ];

  protected readonly airQualityItems = [
    { label: 'PM2.5', value: 42 },
    { label: 'PM10', value: 78 },
    { label: 'NO2', value: 118 },
    { label: 'O3', value: 162 }
  ];
}
