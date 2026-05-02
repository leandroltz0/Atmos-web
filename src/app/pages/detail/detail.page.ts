import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AqiPanelComponent } from '../../shared/components/aqi-panel';
import { MoonPhaseComponent } from '../../shared/components/moon-phase';
import { RainBarsChartComponent } from '../../shared/components/rain-bars-chart';
import { SectionCardComponent } from '../../shared/components/section-card';
import { StatCellComponent } from '../../shared/components/stat-cell';
import { SunTimelineComponent } from '../../shared/components/sun-timeline';
import { TemperatureChartComponent } from '../../shared/components/temperature-chart';
import { UvBadgeComponent } from '../../shared/components/uv-badge';
import { UvTimelineComponent } from '../../shared/components/uv-timeline';
import { WeatherTabsComponent } from '../../shared/components/weather-tabs';
import { WindRoseComponent } from '../../shared/components/wind-rose';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    SectionCardComponent,
    WeatherTabsComponent,
    SunTimelineComponent,
    MoonPhaseComponent,
    TemperatureChartComponent,
    UvBadgeComponent,
    UvTimelineComponent,
    AqiPanelComponent,
    StatCellComponent,
    RainBarsChartComponent,
    WindRoseComponent
  ],
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

  protected readonly airQuality = {
    aqi: 42,
    pm25: 12,
    pm10: 18,
    o3: 31,
    no2: 8
  };
}
