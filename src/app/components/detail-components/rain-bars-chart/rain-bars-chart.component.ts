import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionCardComponent } from '../section-card';

export interface RainPoint {
  hour: string;
  probability: number;
}

type RainBarPoint = RainPoint & {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  showHourLabel: boolean;
  isPeak: boolean;
};

const SVG_HEIGHT = 160;
const PAD_LEFT = 16;
const PAD_RIGHT = 16;
const PAD_TOP = 32;
const PAD_BOTTOM = 36;
const BAR_RADIUS = 4;

const DEFAULT_RAIN_DATA: RainPoint[] = [
  { hour: '5am', probability: 8 },
  { hour: '6am', probability: 10 },
  { hour: '7am', probability: 12 },
  { hour: '8am', probability: 16 },
  { hour: '9am', probability: 22 },
  { hour: '10am', probability: 28 },
  { hour: '11am', probability: 36 },
  { hour: '12pm', probability: 48 },
  { hour: '1pm', probability: 58 },
  { hour: '2pm', probability: 68 },
  { hour: '3pm', probability: 82 },
  { hour: '4pm', probability: 84 },
  { hour: '5pm', probability: 70 },
  { hour: '6pm', probability: 48 },
  { hour: '7pm', probability: 26 },
  { hour: '8pm', probability: 18 }
];

@Component({
  selector: 'app-rain-bars-chart',
  standalone: true,
  imports: [CommonModule, SectionCardComponent],
  templateUrl: './rain-bars-chart.component.html',
  styleUrl: './rain-bars-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RainBarsChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: RainPoint[] = [...DEFAULT_RAIN_DATA];
  @ViewChild('chartContainer') private readonly chartContainerRef?: ElementRef<HTMLDivElement>;

  protected readonly svgHeight = SVG_HEIGHT;
  protected readonly barRadius = BAR_RADIUS;
  protected readonly gradientId = `rain-bars-gradient-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly baselineY = SVG_HEIGHT - PAD_BOTTOM;
  protected containerWidth = 1;
  protected bars: RainBarPoint[] = [];

  private resizeObserver?: ResizeObserver;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateLayout();
    this.bindResizeObserver();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private bindResizeObserver(): void {
    const container = this.chartContainerRef?.nativeElement;

    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.updateLayout());
    this.resizeObserver.observe(container);
  }

  private updateLayout(): void {
    const container = this.chartContainerRef?.nativeElement;
    const source = this.data.length > 0 ? this.data : DEFAULT_RAIN_DATA;
    const measuredWidth = container?.clientWidth ?? 0;

    if (measuredWidth <= 0) {
      return;
    }

    this.containerWidth = measuredWidth;

    const availableWidth = this.containerWidth - PAD_LEFT - PAD_RIGHT;
    const slotWidth = availableWidth / source.length;
    const barWidth = slotWidth * 0.55;
    const gap = slotWidth * 0.45;
    const maxBarHeight = this.baselineY - PAD_TOP;
    const hideAlternateLabels = this.containerWidth < 400;

    this.bars = source.map((item, index) => {
      const height = (item.probability / 100) * maxBarHeight;
      const x = PAD_LEFT + index * (barWidth + gap) + gap / 2;
      const y = this.baselineY - height;
      const opacity = 0.25 + (item.probability / 100) * 0.75;

      return {
        ...item,
        x,
        y,
        width: barWidth,
        height,
        opacity,
        showHourLabel: !hideAlternateLabels || index % 2 === 0,
        isPeak: item.probability >= 80
      };
    });

    this.cdr.markForCheck();
  }
}
