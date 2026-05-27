import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { forkJoin } from 'rxjs';
import { gsap } from 'gsap';

import { WeatherIconComponent } from '../../shared/components/weather-icon/weather-icon.component';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  MOCK_CURRENT,
  MOCK_DAILY,
  MOCK_HOURLY
} from './mock-weather.data';
import {
  getAqiAppearance,
  getTempRange,
  getUvAppearance
} from './dashboard.utils';
import { AuthService } from '../../core/services/auth.service';
import { WeatherService } from '../../core/services/weather.service';
import {
  weatherCodeToCondition,
  weatherCodeToLabel,
  degreesToCardinal,
  extractHour,
  formatDayName,
  formatDateShort,
  formatHour
} from '../../core/services/weather.utils';

const INITIAL_LOADING_MS = 800;
const DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
    WeatherIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit, OnDestroy {
  protected readonly currentWeather = signal<CurrentWeather>({ ...MOCK_CURRENT });
  protected readonly hourlyForecast = signal<HourlyForecast[]>([...MOCK_HOURLY]);
  protected readonly dailyForecast = signal<DailyForecast[]>([...MOCK_DAILY]);
  protected readonly isLoading = signal(true);
  protected readonly isOffline = signal(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  protected readonly now = signal(new Date());
  protected readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1280);
  protected readonly segments = [1, 2, 3, 4, 5];
  protected readonly visibilityMarkers = [1, 2, 3];
  protected readonly needsLocation = signal(false);

  protected readonly formattedDate = computed(() => DATE_FORMATTER.format(this.now()));

  protected readonly minutesAgo = computed(() =>
    Math.max(0, Math.round((this.now().getTime() - this.currentWeather().lastUpdated.getTime()) / 60000))
  );

  protected readonly aqiAppearance = computed(() => getAqiAppearance(this.currentWeather().aqi));
  protected readonly aqiColor = computed(() => this.aqiAppearance().color);
  protected readonly aqiBg = computed(() => this.aqiAppearance().background);

  protected readonly uvAppearance = computed(() => getUvAppearance(this.currentWeather().uvIndex));
  protected readonly uvLabel = computed(() => this.uvAppearance().label);
  protected readonly uvColor = computed(() => this.uvAppearance().color);

  protected readonly tempRange = computed(() => getTempRange(this.dailyForecast()));

  protected readonly weatherIconSize = computed(() => this.isMobile() ? 88 : 112);

  private readonly dashboardRootEl = viewChild<ElementRef<HTMLElement>>('dashboardRoot');
  private readonly heroTempEl = viewChild<ElementRef<HTMLElement>>('heroTemp');

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly weatherService = inject(WeatherService);

  private ctx?: gsap.Context;
  private loadTimer?: number;
  private clockTimer?: number;
  private currentLat?: number;
  private currentLon?: number;

  private readonly handleOnline = () => this.isOffline.set(false);
  private readonly handleOffline = () => this.isOffline.set(true);

  ngOnInit(): void {
    this.startClock();
    this.bindNetworkEvents();

    const params = this.activatedRoute.snapshot.queryParams;
    const lat = params['lat'] || localStorage.getItem('atmos_lat');
    const lon = params['lon'] || localStorage.getItem('atmos_lon');
    const city = params['city'] || 'Ubicación actual';
    const country = params['country'] || '';

    if (lat && lon) {
      this.currentLat = Number(lat);
      this.currentLon = Number(lon);
      this.needsLocation.set(false);
      this.loadWeatherData(city, country);
    } else {
      this.needsLocation.set(true);
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.ctx?.revert();

    if (this.loadTimer !== undefined) {
      window.clearTimeout(this.loadTimer);
    }

    if (this.clockTimer !== undefined) {
      window.clearInterval(this.clockTimer);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  protected trackByHour(_index: number, item: HourlyForecast): string {
    return item.hour;
  }

  protected trackByDate(_index: number, item: DailyForecast): string {
    return item.date;
  }

  protected onRefresh(): void {
    if (this.isLoading() || !this.currentLat || !this.currentLon) return;

    this.ctx?.revert();
    this.isLoading.set(true);

    this.loadWeatherData(this.currentWeather().cityName, this.currentWeather().country);
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

  protected isCurrentHour(hourStr: string): boolean {
    const currentHour = this.now().getHours().toString().padStart(2, '0') + ':00';
    return hourStr === currentHour;
  }

  protected isMobile(): boolean {
    return this.viewportWidth() < 640;
  }

  protected isDesktop(): boolean {
    return this.viewportWidth() >= 1024;
  }

  protected visibilityActive(segment: number): boolean {
    return this.currentWeather().visibility >= segment * 4;
  }

  // ── Navigation ─────────────────────────────────────────
  protected goToDetail(): void {
    void this.router.navigate(['/detail']);
  }

  protected goToFavorites(): void {
    void this.router.navigate(['/favorites']);
  }

  protected goToSearch(): void {
    void this.router.navigate(['/search']);
  }

  protected goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  protected goToSettings(): void {
    void this.router.navigate(['/settings']);
  }

  // ── Private ─────────────────────────────────────────────
  private loadWeatherData(city: string, country: string): void {
    const lat = this.currentLat!;
    const lon = this.currentLon!;

    forkJoin({
      current: this.weatherService.getCurrentWeather(lat, lon),
      forecast: this.weatherService.getForecast(lat, lon)
    }).subscribe({
      next: ({ current: currentRes, forecast }) => {
        const wmoCode = currentRes.current?.weatherCode ?? 0;
        const isDay = currentRes.current?.isDay ?? 1;

        let sunrise = '';
        let sunset = '';
        if (forecast.daily?.sunrise?.length) {
          sunrise = formatHour(forecast.daily.sunrise[0]);
        }
        if (forecast.daily?.sunset?.length) {
          sunset = formatHour(forecast.daily.sunset[0]);
        }

        const current: CurrentWeather = {
          cityName: city,
          country,
          temp: Math.round(currentRes.current?.temperature ?? 0),
          feelsLike: Math.round(currentRes.current?.apparentTemperature ?? 0),
          condition: weatherCodeToCondition(wmoCode, isDay),
          conditionLabel: weatherCodeToLabel(wmoCode),
          humidity: currentRes.current?.humidity ?? 0,
          windSpeed: Math.round(currentRes.current?.windSpeed ?? 0),
          windDirection: degreesToCardinal(currentRes.current?.windDirection ?? 0),
          windDegrees: currentRes.current?.windDirection ?? 0,
          pressure: currentRes.current?.pressure ?? currentRes.current?.surfacePressure ?? 0,
          aqi: 0,
          aqiLabel: 'No disponible',
          sunrise,
          sunset,
          visibility: 10,
          uvIndex: 0,
          lastUpdated: new Date()
        };

        this.currentWeather.set(current);

        if (forecast.hourly) {
          const hourly: HourlyForecast[] = forecast.hourly.time.map((t: string, i: number) => ({
            hour: extractHour(t),
            temp: Math.round(forecast.hourly.temperature_2m[i]),
            condition: weatherCodeToCondition(forecast.hourly.weather_code[i], 1),
            precipChance: forecast.hourly.precipitation_probability?.[i] ?? 0
          }));
          this.hourlyForecast.set(hourly);
        }

        if (forecast.daily) {
          const daily: DailyForecast[] = forecast.daily.time.map((t: string, i: number) => ({
            day: formatDayName(t, i),
            date: formatDateShort(t),
            tempMax: Math.round(forecast.daily.temperature_2m_max[i]),
            tempMin: Math.round(forecast.daily.temperature_2m_min[i]),
            condition: weatherCodeToCondition(forecast.daily.weather_code[i], 1),
            precipChance: forecast.daily.precipitation_probability_max?.[i] ?? 0
          }));
          this.dailyForecast.set(daily);
        }

        this.loadTimer = window.setTimeout(() => this.finishLoading(), INITIAL_LOADING_MS);
      },
      error: () => {
        this.currentWeather.set({
          ...MOCK_CURRENT,
          cityName: city,
          country
        });
        this.loadTimer = window.setTimeout(() => this.finishLoading(), INITIAL_LOADING_MS);
      }
    });
  }

  private finishLoading(): void {
    this.now.set(new Date());
    this.isLoading.set(false);

    if (this.prefersReducedMotion()) return;

    window.setTimeout(() => this.initAnimations(), 0);
  }

  private initAnimations(): void {
    const root = this.dashboardRootEl()?.nativeElement;
    const heroTemp = this.heroTempEl()?.nativeElement;

    if (!root) return;

    this.ctx?.revert();
    this.ctx = gsap.context(() => {
      gsap.from(root, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        ease: 'power2.out'
      });

      if (heroTemp) {
        const target = this.currentWeather().temp;
        const counter = { val: 0 };
        gsap.fromTo(
          counter,
          { val: target * 0.6 },
          {
            val: target,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: () => {
              heroTemp.textContent = Math.round(counter.val).toString();
            }
          }
        );
      }

      gsap.from('.dash-card', {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.08
      });
    }, root);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private bindNetworkEvents(): void {
    if (typeof window === 'undefined') return;

    this.isOffline.set(!navigator.onLine);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private startClock(): void {
    this.clockTimer = window.setInterval(() => this.now.set(new Date()), 60_000);
  }
}
