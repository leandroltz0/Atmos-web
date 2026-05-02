import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
  getRefreshedWeatherSnapshot,
  getTempRange,
  getUvAppearance
} from './dashboard.utils';

const INITIAL_LOADING_MS = 800;
const REFRESH_LOADING_MS = 600;
const DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, ScrollingModule, WeatherIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected readonly currentWeather = signal<CurrentWeather>({ ...MOCK_CURRENT });
  protected readonly hourlyForecast = signal<HourlyForecast[]>([...MOCK_HOURLY]);
  protected readonly dailyForecast = signal<DailyForecast[]>([...MOCK_DAILY]);
  protected readonly isLoading = signal(true);
  protected readonly isOffline = signal(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  protected readonly now = signal(new Date());
  protected readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1280);
  protected readonly segments = [1, 2, 3, 4, 5];
  protected readonly visibilityMarkers = [1, 2, 3];

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

  protected readonly weatherIconSize = computed(() => this.isMobile() ? 96 : 120);
  protected readonly hourlyItemSize = computed(() => this.isDesktop() ? 84 : 80);

  private readonly dashboardRootEl = viewChild<ElementRef<HTMLElement>>('dashboardRoot');
  private readonly heroTempEl = viewChild<ElementRef<HTMLElement>>('heroTemp');

  private ctx?: gsap.Context;
  private loadTimer?: number;
  private clockTimer?: number;

  private readonly handleOnline = () => this.isOffline.set(false);
  private readonly handleOffline = () => this.isOffline.set(true);

  ngOnInit(): void {
    this.startClock();
    this.bindNetworkEvents();
    this.loadTimer = window.setTimeout(() => this.finishLoading(), INITIAL_LOADING_MS);
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

  protected onRefresh(): void {
    if (this.isLoading()) {
      return;
    }

    this.ctx?.revert();
    this.isLoading.set(true);

    this.loadTimer = window.setTimeout(() => {
      this.applyRefreshSnapshot();
      this.finishLoading();
    }, REFRESH_LOADING_MS);
  }

  protected getTempBarWidth(day: DailyForecast): number {
    const { min, max } = this.tempRange();
    const total = Math.max(max - min, 1);

    return ((day.tempMax - day.tempMin) / total) * 100;
  }

  protected isCurrentHour(hourStr: string): boolean {
    const currentHour = this.now().getHours().toString().padStart(2, '0') + ':00';
    return hourStr === currentHour;
  }

  protected isMobile(): boolean {
    return this.viewportWidth() < 640;
  }

  protected isDesktop(): boolean {
    return this.viewportWidth() >= 1200;
  }

  protected visibilityActive(segment: number): boolean {
    return this.currentWeather().visibility >= segment * 4;
  }

  private finishLoading(): void {
    this.now.set(new Date());
    this.isLoading.set(false);

    if (this.prefersReducedMotion()) {
      return;
    }

    window.setTimeout(() => this.initAnimations(), 0);
  }

  private initAnimations(): void {
    const root = this.dashboardRootEl()?.nativeElement;
    const heroTemp = this.heroTempEl()?.nativeElement;

    if (!root) {
      return;
    }

    this.ctx?.revert();
    this.ctx = gsap.context(() => {
      gsap.from(root, {
        opacity: 0,
        y: 12,
        duration: 0.4,
        ease: 'power2.out'
      });

      if (heroTemp) {
        const target = this.currentWeather().temp;
        const counter = { val: 0 };
        gsap.fromTo(
          counter,
          { val: target },
          {
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              heroTemp.textContent = Math.round(counter.val).toString();
            }
          }
        );
      }

      gsap.from('.glass-card', {
        opacity: 0,
        y: 24,
        scale: 0.98,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.05
      });
    }, root);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private bindNetworkEvents(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isOffline.set(!navigator.onLine);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private startClock(): void {
    this.clockTimer = window.setInterval(() => this.now.set(new Date()), 60_000);
  }

  private applyRefreshSnapshot(): void {
    const snapshot = getRefreshedWeatherSnapshot(
      this.currentWeather(),
      this.hourlyForecast(),
      new Date()
    );

    this.currentWeather.set(snapshot.current);
    this.hourlyForecast.set(snapshot.hourlyForecast);
  }
}
