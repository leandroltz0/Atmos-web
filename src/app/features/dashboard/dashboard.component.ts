import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { gsap } from 'gsap';

import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  MOCK_CURRENT,
  MOCK_DAILY,
  MOCK_HOURLY,
  WeatherCondition
} from './mock-weather.data';

const INITIAL_LOADING_MS = 800;
const REFRESH_LOADING_MS = 600;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, ScrollingModule],
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
  protected readonly aqiSegments = [1, 2, 3, 4, 5];

  protected readonly formattedDate = computed(() =>
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(this.now())
  );

  protected readonly minutesAgo = computed(() =>
    Math.max(0, Math.round((this.now().getTime() - this.currentWeather().lastUpdated.getTime()) / 60000))
  );

  protected readonly updatedLabel = computed(() => {
    const minutes = this.minutesAgo();
    return minutes === 0 ? 'Actualizado recién' : `Actualizado hace ${minutes} min`;
  });

  protected readonly aqiColor = computed(() => {
    const aqi = this.currentWeather().aqi;
    const colors = ['', '#10B981', '#FFD166', '#F97316', '#EF4444', '#7C3AED'];
    return colors[aqi] ?? '#10B981';
  });

  protected readonly uvLabel = computed(() => {
    const uv = this.currentWeather().uvIndex;

    if (uv <= 2) {
      return 'Bajo';
    }

    if (uv <= 5) {
      return 'Moderado';
    }

    if (uv <= 7) {
      return 'Alto';
    }

    if (uv <= 10) {
      return 'Muy alto';
    }

    return 'Extremo';
  });

  protected readonly tempRange = computed(() => {
    const values = this.dailyForecast().flatMap((day) => [day.tempMin, day.tempMax]);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });

  private readonly dashboardRootEl = viewChild<ElementRef<HTMLElement>>('dashboardRoot');
  private readonly heroTempEl = viewChild<ElementRef<HTMLElement>>('heroTemp');
  private readonly cardsEl = viewChildren<ElementRef<HTMLElement>>('weatherCard');
  private readonly hourlyEl = viewChild<ElementRef<HTMLElement>>('hourlyScroll');

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

  protected getTempBarOffset(day: DailyForecast): number {
    const { min, max } = this.tempRange();
    const total = Math.max(max - min, 1);

    return ((day.tempMin - min) / total) * 100;
  }

  protected windArrowTransform(direction: string): string {
    const directions: Record<string, number> = {
      N: 0,
      NE: 45,
      E: 90,
      SE: 135,
      S: 180,
      SO: 225,
      O: 270,
      NO: 315
    };

    return `rotate(${directions[direction] ?? 0}deg)`;
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
    const cards = this.cardsEl().map((card) => card.nativeElement);
    const hourly = this.hourlyEl()?.nativeElement;

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
        const finalTemp = this.currentWeather().temp;
        gsap.fromTo(
          heroTemp,
          { textContent: 0 },
          {
            textContent: finalTemp,
            duration: 1.2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate: () => {
              const value = Number(heroTemp.textContent ?? 0);
              heroTemp.textContent = `${Math.round(value)}°`;
            },
            onComplete: () => {
              heroTemp.textContent = `${finalTemp}°`;
            }
          }
        );
      }

      if (cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 32,
          scale: 0.97,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.05
        });
      }

      if (hourly) {
        gsap.from(hourly, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.35
        });
      }
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
    const current = this.currentWeather();
    const tempDelta = current.temp >= 20 ? -1 : 1;
    const now = new Date();

    this.currentWeather.set({
      ...current,
      temp: this.clamp(current.temp + tempDelta, 7, 33),
      feelsLike: this.clamp(current.feelsLike + tempDelta, 6, 35),
      humidity: this.clamp(current.humidity - 2, 42, 92),
      windSpeed: this.clamp(current.windSpeed + 1, 4, 40),
      pressure: this.clamp(current.pressure - 1, 995, 1035),
      lastUpdated: now
    });

    this.hourlyForecast.set(
      this.hourlyForecast().map((item, index) => ({
        ...item,
        temp: index < 8 ? this.clamp(item.temp + tempDelta, 6, 34) : item.temp
      }))
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
