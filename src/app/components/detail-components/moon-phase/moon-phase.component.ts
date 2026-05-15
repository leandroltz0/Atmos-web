import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { SectionCardComponent } from '../section-card';

const MOON_CENTER = 45;
const MOON_RADIUS = 45;
const MOON_DIAMETER = 90;
let nextClipPathId = 0;

@Component({
  selector: 'app-moon-phase',
  standalone: true,
  imports: [CommonModule, SectionCardComponent],
  templateUrl: './moon-phase.component.html',
  styleUrl: './moon-phase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoonPhaseComponent {
  @Input() phase = 0.72;
  @Input() phaseName = 'Gibosa menguante';
  @Input() illumination = 68;
  @Input() moonrise = '21:14';
  @Input() moonset = '08:32';

  protected readonly moonCenter = MOON_CENTER;
  protected readonly moonRadius = MOON_RADIUS;
  protected readonly clipPathId = `moon-phase-clip-${nextClipPathId++}`;

  protected get normalizedPhase(): number {
    return this.clamp(this.phase, 0, 1);
  }

  protected get illuminationPath(): string {
    const illumination = this.normalizedIllumination;

    if (illumination <= 0) {
      return '';
    }

    if (illumination >= 1) {
      return this.fullMoonPath;
    }

    const terminatorX = MOON_CENTER + this.terminatorOffset;
    const topY = MOON_CENTER - MOON_RADIUS;
    const bottomY = MOON_CENTER + MOON_RADIUS;
    const controlY = MOON_RADIUS * 0.78;
    const outerArcSweep = this.isWaningPhase ? 0 : 1;

    return [
      `M ${MOON_CENTER} ${topY}`,
      `A ${MOON_RADIUS} ${MOON_RADIUS} 0 0 ${outerArcSweep} ${MOON_CENTER} ${bottomY}`,
      `C ${terminatorX} ${MOON_CENTER + controlY} ${terminatorX} ${MOON_CENTER - controlY} ${MOON_CENTER} ${topY}`,
      'Z'
    ].join(' ');
  }

  protected get hasVisibleIllumination(): boolean {
    return this.normalizedIllumination > 0;
  }

  protected get normalizedIllumination(): number {
    return this.clamp(this.illumination, 0, 100) / 100;
  }

  protected get illuminationLabel(): string {
    return `${Math.round(this.normalizedIllumination * 100)}%`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private get isWaningPhase(): boolean {
    return this.normalizedPhase > 0.5;
  }

  private get terminatorOffset(): number {
    const polarity = this.isWaningPhase ? 1 : -1;

    return (this.normalizedIllumination - 0.5) * 2 * MOON_RADIUS * polarity;
  }

  private get fullMoonPath(): string {
    const topY = MOON_CENTER - MOON_RADIUS;
    const bottomY = MOON_CENTER + MOON_RADIUS;

    return [
      `M ${MOON_CENTER} ${topY}`,
      `A ${MOON_RADIUS} ${MOON_RADIUS} 0 1 1 ${MOON_CENTER} ${bottomY}`,
      `A ${MOON_RADIUS} ${MOON_RADIUS} 0 1 1 ${MOON_CENTER} ${topY}`,
      'Z'
    ].join(' ');
  }
}
