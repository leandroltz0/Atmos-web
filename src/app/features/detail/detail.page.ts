import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { WeatherTabsComponent } from '../../components/detail-components/weather-tabs';
import { DetailTabComponent } from '../../components/detail-components/detail-tab/detail-tab.component';
import type { HourlyChartDatum } from '../../components/detail-components/detail-tab/components/hourly-chart/hourly-chart.component';
import {
  TodayTabComponent,
  type TodayForecastItem,
  type TodayHighlight
} from '../../components/detail-components/today-tab/today-tab.component';
import { WeeklyTabComponent } from '../../components/detail-components/weekly-tab/weekly-tab.component';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, WeatherTabsComponent, TodayTabComponent, DetailTabComponent, WeeklyTabComponent],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailPage {
  protected selectedTabIndex = 0;

  constructor(private readonly location: Location) {}

  protected goBack(): void {
    this.location.back();
  }

  protected readonly highlights: TodayHighlight[] = [
    { label: 'Sensacion termica', value: '29°' },
    { label: 'Humedad', value: '64%' },
    { label: 'Viento', value: '18', unit: 'km/h' }
  ];

  protected readonly weeklyForecast = [
    { day: 'Hoy', icon: '/assets/icons/weather/partly-cloudy-day.svg', min: 18, max: 29, rain: 18 },
    { day: 'Lun', icon: '/assets/icons/weather/sun.svg', min: 17, max: 28, rain: 8 },
    { day: 'Mar', icon: '/assets/icons/weather/cloudy.svg', min: 16, max: 25, rain: 22 },
    { day: 'Mie', icon: '/assets/icons/weather/rain.svg', min: 15, max: 23, rain: 54 },
    { day: 'Jue', icon: '/assets/icons/weather/thunderstorms-rain.svg', min: 14, max: 21, rain: 68 },
    { day: 'Vie', icon: '/assets/icons/weather/cloudy.svg', min: 15, max: 22, rain: 26 },
    { day: 'Sab', icon: '/assets/icons/weather/sun.svg', min: 16, max: 27, rain: 10 }
  ];

  protected readonly hourlyForecast: TodayForecastItem[] = [
    { hour: '14:00', temp: '27°', state: 'Parcialmente nublado' },
    { hour: '15:00', temp: '28°', state: 'Brisa suave' },
    { hour: '16:00', temp: '26°', state: 'Prob. de lluvia 20%' },
    { hour: '17:00', temp: '24°', state: 'Cielo cubierto' }
  ];

  protected readonly hourlyTemperatureData: HourlyChartDatum[] = [
    { hour: '00:00', temp: 19 },
    { hour: '01:00', temp: 18 },
    { hour: '02:00', temp: 18 },
    { hour: '03:00', temp: 17 },
    { hour: '04:00', temp: 17 },
    { hour: '05:00', temp: 16 },
    { hour: '06:00', temp: 16 },
    { hour: '07:00', temp: 17 },
    { hour: '08:00', temp: 19 },
    { hour: '09:00', temp: 21 },
    { hour: '10:00', temp: 23 },
    { hour: '11:00', temp: 24 },
    { hour: '12:00', temp: 26 },
    { hour: '13:00', temp: 27 },
    { hour: '14:00', temp: 28 },
    { hour: '15:00', temp: 28 },
    { hour: '16:00', temp: 27 },
    { hour: '17:00', temp: 25 },
    { hour: '18:00', temp: 24 },
    { hour: '19:00', temp: 22 },
    { hour: '20:00', temp: 21 },
    { hour: '21:00', temp: 20 },
    { hour: '22:00', temp: 20 },
    { hour: '23:00', temp: 19 }
  ];

  protected readonly airQuality = {
    aqi: 42,
    pm25: 12,
    pm10: 18,
    o3: 31,
    no2: 8
  };

  protected readonly detailAtmosphericMetrics = [
    { label: 'Punto de rocio', value: '15°' },
    { label: 'Visibilidad', value: '10', unit: 'km' },
    { label: 'Presion', value: '1014', unit: 'hPa' },
    { label: 'Sensacion termica', value: '29°' }
  ];

  protected setSelectedTab(index: number): void {
    this.selectedTabIndex = index;
  }
}
