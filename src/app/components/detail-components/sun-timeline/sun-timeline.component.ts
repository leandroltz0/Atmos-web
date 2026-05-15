import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { SectionCardComponent } from '../section-card';

type Point = {
  x: number;
  y: number;
};

type SunCoordinates = Point & {
  opacity: number;
};

const ARC_START: Point = { x: 40, y: 120 };
const ARC_CONTROL: Point = { x: 200, y: 10 };
const ARC_END: Point = { x: 360, y: 120 };
const MINUTES_PER_HOUR = 60;
let nextGradientId = 0;

@Component({
  selector: 'app-sun-timeline',
  standalone: true,
  imports: [SectionCardComponent],
  templateUrl: './sun-timeline.component.html',
  styleUrl: './sun-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SunTimelineComponent {
  @Input() sunrise = '06:47';
  @Input() sunset = '19:53';
  @Input() currentTime = '14:00';
  @Input() daylightHours = 13;
  @Input() solarNoon = '13:20';

  protected readonly arcGradientId = `sun-arc-gradient-${nextGradientId}`;
  protected readonly areaGradientId = `sun-area-gradient-${nextGradientId++}`;

  protected get sunPosition(): SunCoordinates {
    const sunriseMinutes = this.toMinutes(this.sunrise);
    const sunsetMinutes = this.toMinutes(this.sunset);
    const currentMinutes = this.toMinutes(this.currentTime);
    const duration = sunsetMinutes - sunriseMinutes;

    if (duration <= 0) {
      return {
        ...ARC_START,
        opacity: 0.4
      };
    }

    const progress = (currentMinutes - sunriseMinutes) / duration;

    if (progress <= 0) {
      return {
        ...ARC_START,
        opacity: 0.4
      };
    }

    if (progress >= 1) {
      return {
        ...ARC_END,
        opacity: 0.4
      };
    }

    const point = this.getQuadraticBezierPoint(progress);

    return {
      ...point,
      opacity: 1
    };
  }

  protected get daylightLabel(): string {
    return `${this.daylightHours}h de luz`;
  }

  private getQuadraticBezierPoint(t: number): Point {
    const oneMinusT = 1 - t;
    const x =
      oneMinusT * oneMinusT * ARC_START.x +
      2 * oneMinusT * t * ARC_CONTROL.x +
      t * t * ARC_END.x;
    const y =
      oneMinusT * oneMinusT * ARC_START.y +
      2 * oneMinusT * t * ARC_CONTROL.y +
      t * t * ARC_END.y;

    return { x, y };
  }

  private toMinutes(value: string): number {
    const [hoursPart = '0', minutesPart = '0'] = value.split(':');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return 0;
    }

    return hours * MINUTES_PER_HOUR + minutes;
  }
}
