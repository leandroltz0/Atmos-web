import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { gsap } from 'gsap';

import { WeatherIconComponent } from '../../shared/components/weather-icon/weather-icon.component';
import {
  DailyDetailForecast,
  DetailWeather,
  HourlyDetail,
  MOCK_DETAIL
} from './mock-detail.data';

type ChartPoint = {
  x: number;
  y: number;
  item: HourlyDetail;
  index: number;
};

type WindDirectionPoint = {
  label: string;
  angle: number;
  labelX: number;
  labelY: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
};

type PollutantRow = {
  label: string;
  unit: string;
  value: number;
  limit: number;
  width: number;
  color: string;
};

const TEMP_CHART_WIDTH = 760;
const TEMP_CHART_HEIGHT = 220;
const TEMP_CHART_PADDING = { top: 24, right: 20, bottom: 30, left: 40 };
const TEMP_GUIDE_COUNT = 4;

const WIND_ROSE_SIZE = 200;
const WIND_ROSE_CENTER = WIND_ROSE_SIZE / 2;
const WIND_ROSE_INNER_RADIUS = 26;
const WIND_ROSE_OUTER_RADIUS = 72;
const WIND_ROSE_LABEL_RADIUS = 90;
const WIND_DIRECTIONS = [
  { label: 'N', angle: -90 },
  { label: 'NE', angle: -45 },
  { label: 'E', angle: 0 },
  { label: 'SE', angle: 45 },
  { label: 'S', angle: 90 },
  { label: 'SO', angle: 135 },
  { label: 'O', angle: 180 },
  { label: 'NO', angle: 225 }
] as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const parseHourToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const describeWindDirection = (degrees: number): string => {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return WIND_DIRECTIONS[index].label;
};

const buildSmoothPath = (points: ChartPoint[]): string => {
  if (!points.length) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = (previous.x + current.x) / 2;
    path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
};

const polarToCartesian = (angleDegrees: number, radius: number): { x: number; y: number } => {
  const angleRadians = angleDegrees * (Math.PI / 180);
  return {
    x: WIND_ROSE_CENTER + Math.cos(angleRadians) * radius,
    y: WIND_ROSE_CENTER + Math.sin(angleRadians) * radius
  };
};

const buildWindWedgePath = (angleDegrees: number): string => {
  const start = polarToCartesian(angleDegrees - 14, WIND_ROSE_OUTER_RADIUS);
  const end = polarToCartesian(angleDegrees + 14, WIND_ROSE_OUTER_RADIUS);
  const inner = polarToCartesian(angleDegrees, WIND_ROSE_INNER_RADIUS);

  return `M ${inner.x} ${inner.y} L ${start.x} ${start.y} A ${WIND_ROSE_OUTER_RADIUS} ${WIND_ROSE_OUTER_RADIUS} 0 0 1 ${end.x} ${end.y} Z`;
};

const pollutantColor = (ratio: number): string => {
  if (ratio <= 0.45) {
    return '#10B981';
  }

  if (ratio <= 0.75) {
    return '#FFD166';
  }

  if (ratio <= 1) {
    return '#F97316';
  }

  return '#EF4444';
};

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatSnackBarModule, WeatherIconComponent],
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailPage implements AfterViewInit, OnDestroy {
  protected readonly weather = signal<DetailWeather>({ ...MOCK_DETAIL });
  protected readonly activeTab = signal(0);
  protected readonly hoveredHourIndex = signal<number | null>(null);

  protected readonly tempChartPoints = computed<ChartPoint[]>(() => {
    const items = this.weather().hourly;
    const plotWidth = TEMP_CHART_WIDTH - TEMP_CHART_PADDING.left - TEMP_CHART_PADDING.right;
    const plotHeight = TEMP_CHART_HEIGHT - TEMP_CHART_PADDING.top - TEMP_CHART_PADDING.bottom;
    const temperatures = items.map((item) => item.temp);
    const minTemperature = Math.min(...temperatures);
    const maxTemperature = Math.max(...temperatures);
    const range = Math.max(maxTemperature - minTemperature, 1);

    return items.map((item, index) => {
      const x = TEMP_CHART_PADDING.left + (index / (items.length - 1)) * plotWidth;
      const normalized = (item.temp - minTemperature) / range;
      const y = TEMP_CHART_PADDING.top + (1 - normalized) * plotHeight;

      return { x, y, item, index };
    });
  });

  protected readonly tempLinePath = computed(() => buildSmoothPath(this.tempChartPoints()));
  protected readonly tempAreaPath = computed(() => {
    const points = this.tempChartPoints();
    if (!points.length) {
      return '';
    }

    const line = buildSmoothPath(points);
    const baseY = TEMP_CHART_HEIGHT - TEMP_CHART_PADDING.bottom;
    return `${line} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  });

  protected readonly tempGuideLines = computed(() => {
    const plotHeight = TEMP_CHART_HEIGHT - TEMP_CHART_PADDING.top - TEMP_CHART_PADDING.bottom;
    return Array.from({ length: TEMP_GUIDE_COUNT }, (_value, index) => TEMP_CHART_PADDING.top + (plotHeight / (TEMP_GUIDE_COUNT - 1)) * index);
  });

  protected readonly xAxisLabels = computed(() => this.tempChartPoints().filter((point) => point.index % 3 === 0));
  protected readonly observedHourIndex = computed(() => {
    const index = this.weather().hourly.findIndex((item) => item.hour === this.weather().observedAt);
    return index >= 0 ? index : 0;
  });
  protected readonly observedPoint = computed(() => this.tempChartPoints()[this.observedHourIndex()]);
  protected readonly activeTooltipIndex = computed(() => this.hoveredHourIndex() ?? this.observedHourIndex());
  protected readonly activeTooltipHour = computed(() => {
    const index = this.activeTooltipIndex();
    return index >= 0 ? this.weather().hourly[index] : null;
  });
  protected readonly activeTooltipPoint = computed(() => {
    const index = this.activeTooltipIndex();
    return index >= 0 ? this.tempChartPoints()[index] : null;
  });
  protected readonly temperatureTooltipPosition = computed(() => {
    const point = this.activeTooltipPoint();
    if (!point) {
      return { left: 0, top: 0 };
    }

    return {
      left: (point.x / TEMP_CHART_WIDTH) * 100,
      top: (point.y / TEMP_CHART_HEIGHT) * 100
    };
  });

  protected readonly pollutantRows = computed<PollutantRow[]>(() => {
    const airQuality = this.weather().airQuality;

    return [
      { label: 'PM2.5', value: airQuality.pm25, unit: 'µg/m³', limit: 25 },
      { label: 'PM10', value: airQuality.pm10, unit: 'µg/m³', limit: 50 },
      { label: 'O₃', value: airQuality.o3, unit: 'µg/m³', limit: 100 },
      { label: 'NO₂', value: airQuality.no2, unit: 'µg/m³', limit: 40 }
    ].map((item) => {
      const ratio = item.value / item.limit;
      return {
        ...item,
        width: Math.min(ratio, 1.15) * 100,
        color: pollutantColor(ratio)
      };
    });
  });

  protected readonly aqiColor = computed(() => {
    const aqi = this.weather().airQuality.aqi;
    const colors = ['', '#10B981', '#FFD166', '#F97316', '#EF4444', '#7C3AED'];
    return colors[aqi] ?? '#10B981';
  });

  protected readonly windRoseDirections = computed<WindDirectionPoint[]>(() => {
    const currentDegrees = this.weather().windDeg;
    const currentIndex = Math.round((((currentDegrees % 360) + 360) % 360) / 45) % 8;

    return WIND_DIRECTIONS.map((direction, index) => {
      const spokeStart = polarToCartesian(direction.angle, 36);
      const spokeEnd = polarToCartesian(direction.angle, 78);
      const labelPoint = polarToCartesian(direction.angle, WIND_ROSE_LABEL_RADIUS);

      return {
        label: direction.label,
        angle: direction.angle,
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        x1: spokeStart.x,
        y1: spokeStart.y,
        x2: spokeEnd.x,
        y2: spokeEnd.y,
        active: index === currentIndex
      };
    });
  });

  protected readonly activeWindWedgePath = computed(() => {
    const currentDegrees = this.weather().windDeg;
    return buildWindWedgePath(currentDegrees - 90);
  });

  protected readonly visibilitySegments = [1, 2, 3];

  protected readonly sunProgress = computed(() => {
    const observedMinutes = parseHourToMinutes(this.weather().observedAt);
    const sunriseMinutes = parseHourToMinutes(this.weather().sunMoon.sunrise);
    const sunsetMinutes = parseHourToMinutes(this.weather().sunMoon.sunset);

    return clamp((observedMinutes - sunriseMinutes) / Math.max(sunsetMinutes - sunriseMinutes, 1), 0, 1);
  });

  protected readonly isDaytime = computed(() => {
    const observedMinutes = parseHourToMinutes(this.weather().observedAt);
    const sunriseMinutes = parseHourToMinutes(this.weather().sunMoon.sunrise);
    const sunsetMinutes = parseHourToMinutes(this.weather().sunMoon.sunset);
    return observedMinutes >= sunriseMinutes && observedMinutes <= sunsetMinutes;
  });

  protected readonly sunCoordinates = computed(() => {
    const progress = this.sunProgress();
    const angle = Math.PI - progress * Math.PI;
    const cx = 160;
    const cy = 140;
    const radius = 104;

    return {
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle)
    };
  });

  protected readonly moonShadow = computed(() => {
    const phase = this.weather().sunMoon.moonPhase;
    const illumination = this.weather().sunMoon.moonIllumination / 100;
    const waxing = phase <= 0.5;

    return {
      cx: 40 + (waxing ? -1 : 1) * illumination * 14,
      rx: Math.max(6, 34 - illumination * 14)
    };
  });

  protected readonly pressureTrend = computed(() => {
    const pressure = this.weather().pressure;

    if (pressure >= 1018) {
      return '↑ En alza';
    }

    if (pressure <= 1012) {
      return '↓ Bajando';
    }

    return '→ Estable';
  });

  protected readonly tempChartWidth = TEMP_CHART_WIDTH;
  protected readonly tempChartHeight = TEMP_CHART_HEIGHT;
  protected readonly windRoseSize = WIND_ROSE_SIZE;
  protected readonly prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly detailRoot = viewChild.required<ElementRef<HTMLElement>>('detailRoot');
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private ctx?: gsap.Context;

  ngAfterViewInit(): void {
    window.setTimeout(() => this.runTabAnimations(this.activeTab()), 0);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  protected onTabChange(index: number): void {
    this.activeTab.set(index);
    this.hoveredHourIndex.set(null);
    window.setTimeout(() => this.runTabAnimations(index), 40);
  }

  protected onShowTooltip(index: number): void {
    this.hoveredHourIndex.set(index);
  }

  protected onHideTooltip(): void {
    this.hoveredHourIndex.set(null);
  }

  protected onGoBack(): void {
    void this.router.navigate(['/home']);
  }

  protected async onShare(): Promise<void> {
    const weather = this.weather();
    const sharePayload = {
      title: `Clima en ${weather.cityName}`,
      text: `${weather.temp}°C, ${weather.conditionLabel}. Sensación: ${weather.feelsLike}°C`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      await navigator.clipboard.writeText(sharePayload.url);
      this.snackBar.open('Enlace copiado al portapapeles', '', { duration: 2500 });
    } catch {
      this.snackBar.open('No se pudo compartir el clima ahora mismo', '', { duration: 2500 });
    }
  }

  protected getPrecipBarHeight(item: HourlyDetail): number {
    return clamp(item.precipChance, 0, 100);
  }

  protected getUvBarHeight(item: HourlyDetail): number {
    return clamp((item.uvIndex / 11) * 100, 8, 100);
  }

  protected getUvColor(value: number): string {
    if (value <= 2) {
      return '#10B981';
    }

    if (value <= 5) {
      return '#FFD166';
    }

    if (value <= 7) {
      return '#F97316';
    }

    if (value <= 10) {
      return '#EF4444';
    }

    return '#7C3AED';
  }

  protected getDailyTempBarWidth(day: DailyDetailForecast): number {
    const values = this.weather().daily.flatMap((item) => [item.tempMin, item.tempMax]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = Math.max(max - min, 1);

    return ((day.tempMax - day.tempMin) / total) * 100;
  }

  protected getDailyTempBarOffset(day: DailyDetailForecast): number {
    const values = this.weather().daily.flatMap((item) => [item.tempMin, item.tempMax]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = Math.max(max - min, 1);

    return ((day.tempMin - min) / total) * 100;
  }

  protected getVisibilityActive(segment: number): boolean {
    return this.weather().visibility >= segment * 4;
  }

  protected trackByHour(_index: number, item: HourlyDetail): string {
    return item.hour;
  }

  protected trackByDay(_index: number, item: DailyDetailForecast): string {
    return item.date;
  }

  protected trackByPollutant(_index: number, item: PollutantRow): string {
    return item.label;
  }

  protected currentWindDirectionLabel(): string {
    return describeWindDirection(this.weather().windDeg);
  }

  private runTabAnimations(index: number): void {
    const root = this.detailRoot().nativeElement;
    const panel = root.querySelector<HTMLElement>(`.detail-tab-panel[data-tab-index="${index}"]`);

    if (!panel) {
      return;
    }

    this.ctx?.revert();

    if (this.prefersReducedMotion) {
      return;
    }

    this.ctx = gsap.context(() => {
      gsap.from(panel.querySelectorAll('.detail-section'), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08
      });

      if (index === 0) {
        this.animateTemperatureLine(panel);
        gsap.from(panel.querySelectorAll('.precip-bar__fill'), {
          scaleY: 0,
          transformOrigin: 'bottom center',
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.02,
          delay: 0.2
        });
        gsap.from(panel.querySelectorAll('.uv-column__fill'), {
          scaleY: 0,
          transformOrigin: 'bottom center',
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.02,
          delay: 0.25
        });
      }

      if (index === 1) {
        gsap.from(panel.querySelectorAll('.weekly-row'), {
          opacity: 0,
          y: 14,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.05,
          delay: 0.1
        });
      }

      if (index === 2) {
        gsap.from(panel.querySelectorAll('.aqi-pollutant__fill'), {
          scaleX: 0,
          transformOrigin: 'left center',
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
          delay: 0.2
        });
        this.animateSolarArc(panel);
        gsap.from(panel.querySelectorAll('.detail-mini-card, .sun-moon-card, .wind-card, .aqi-card'), {
          opacity: 0,
          y: 18,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.05,
          delay: 0.08
        });
      }
    }, panel);
  }

  private animateTemperatureLine(panel: HTMLElement): void {
    const path = panel.querySelector<SVGPathElement>('.temp-chart__line');
    if (!path) {
      return;
    }

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      delay: 0.2
    });

    const area = panel.querySelector('.temp-chart__area');
    if (area) {
      gsap.from(area, { opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });
    }

    gsap.from(panel.querySelectorAll('.temp-dot'), {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(2)',
      stagger: 0.03,
      delay: 0.8
    });
  }

  private animateSolarArc(panel: HTMLElement): void {
    const path = panel.querySelector<SVGPathElement>('.solar-arc__path');
    if (!path) {
      return;
    }

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'power2.inOut',
      delay: 0.15
    });

    const sun = panel.querySelector('.solar-arc__sun');
    if (sun) {
      gsap.from(sun, {
        scale: 0,
        opacity: 0,
        duration: 0.45,
        ease: 'back.out(2)',
        delay: 0.65
      });
    }

    const wedge = panel.querySelector('.wind-rose__wedge');
    if (wedge) {
      gsap.from(wedge, {
        scale: 0.85,
        opacity: 0,
        transformOrigin: '50% 50%',
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.22
      });
    }
  }
}
