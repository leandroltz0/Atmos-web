import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionCardComponent } from '../section-card';

type CompassLabel = {
  label: string;
  x: number;
  y: number;
};

const ROSE_SIZE = 160;
const ROSE_CENTER = 80;
const ROSE_RADIUS = 54;
const CARDINAL_LABEL_RADIUS = 68;
const INNER_RING_FACTORS = [0.25, 0.5, 0.75];
const SPOKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

@Component({
  selector: 'app-wind-rose',
  standalone: true,
  imports: [CommonModule, SectionCardComponent],
  templateUrl: './wind-rose.component.html',
  styleUrl: './wind-rose.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindRoseComponent {
  @Input() speedKmh = 18;
  @Input() direction = 220;
  @Input() directionLabel = 'SW';
  @Input() gustKmh = 28;
  @Input() humidity = 64;
  @Input() pressureHpa = 1013;

  protected readonly roseSize = ROSE_SIZE;
  protected readonly center = ROSE_CENTER;
  protected readonly radius = ROSE_RADIUS;
  protected readonly innerRings = INNER_RING_FACTORS.map((factor) => ROSE_RADIUS * factor);

  protected readonly compassLabels: CompassLabel[] = [
    this.buildCompassLabel('N', 0),
    this.buildCompassLabel('NE', 45),
    this.buildCompassLabel('E', 90),
    this.buildCompassLabel('SE', 135),
    this.buildCompassLabel('S', 180),
    this.buildCompassLabel('SW', 225),
    this.buildCompassLabel('W', 270),
    this.buildCompassLabel('NW', 315)
  ];

  protected readonly spokes = SPOKE_ANGLES.map((angle) => this.buildSpoke(angle));

  protected get sensationLabel(): string {
    if (this.speedKmh <= 10) {
      return 'Calma';
    }

    if (this.speedKmh <= 20) {
      return 'Brisa leve';
    }

    if (this.speedKmh <= 35) {
      return 'Brisa moderada';
    }

    if (this.speedKmh <= 50) {
      return 'Viento fuerte';
    }

    return 'Muy fuerte';
  }

  protected get arrowTransform(): string {
    return `rotate(${this.direction}deg)`;
  }

  private buildCompassLabel(label: string, angle: number): CompassLabel {
    const coords = this.getPolarPoint(angle, CARDINAL_LABEL_RADIUS);

    return {
      label,
      x: coords.x,
      y: coords.y
    };
  }

  private buildSpoke(angle: number): { x2: number; y2: number } {
    const coords = this.getPolarPoint(angle, ROSE_RADIUS);

    return {
      x2: coords.x,
      y2: coords.y
    };
  }

  private getPolarPoint(angle: number, distance: number): { x: number; y: number } {
    const radians = (angle - 90) * (Math.PI / 180);

    return {
      x: ROSE_CENTER + Math.cos(radians) * distance,
      y: ROSE_CENTER + Math.sin(radians) * distance
    };
  }
}
