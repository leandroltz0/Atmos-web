import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  NgZone,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionCardComponent } from '../section-card';

export interface UvPoint {
  hour: string;
  uvIndex: number;
}

type UvLevelAppearance = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

type TimelinePoint = UvPoint &
  UvLevelAppearance & {
    isPeak: boolean;
  };

const DEFAULT_UV_DATA: UvPoint[] = [
  { hour: '6am', uvIndex: 0 },
  { hour: '7am', uvIndex: 0 },
  { hour: '8am', uvIndex: 1 },
  { hour: '9am', uvIndex: 2 },
  { hour: '10am', uvIndex: 4 },
  { hour: '11am', uvIndex: 6 },
  { hour: '12pm', uvIndex: 7 },
  { hour: '1pm', uvIndex: 8 },
  { hour: '2pm', uvIndex: 9 },
  { hour: '3pm', uvIndex: 8 },
  { hour: '4pm', uvIndex: 6 },
  { hour: '5pm', uvIndex: 4 },
  { hour: '6pm', uvIndex: 2 },
  { hour: '7pm', uvIndex: 1 },
  { hour: '8pm', uvIndex: 0 }
];

@Component({
  selector: 'app-uv-timeline',
  standalone: true,
  imports: [CommonModule, SectionCardComponent],
  templateUrl: './uv-timeline.component.html',
  styleUrl: './uv-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UvTimelineComponent implements AfterViewInit {
  @Input() data: UvPoint[] = [...DEFAULT_UV_DATA];

  protected readonly isCompact = signal(false);

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly compactThreshold = 500;
  private readonly columnMinWidth = 72;

  protected get points(): TimelinePoint[] {
    const source = this.sourceData;
    const peakValue = Math.max(...source.map((item) => item.uvIndex));
    const peakIndex = source.findIndex((item) => item.uvIndex === peakValue);

    return source.map((item, index) => {
      const appearance = this.getAppearance(item.uvIndex);

      return {
        ...item,
        ...appearance,
        isPeak: index === peakIndex
      };
    });
  }

  protected get gridTemplateColumns(): string {
    return `repeat(${this.sourceData.length}, 1fr)`;
  }

  protected get gridMinWidth(): number {
    return this.sourceData.length * this.columnMinWidth;
  }

  ngAfterViewInit(): void {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const compact = width < this.compactThreshold;

      this.ngZone.run(() => {
        this.isCompact.set(compact);
      });
    });

    resizeObserver.observe(this.hostRef.nativeElement);
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());
  }

  protected getHourLabel(index: number, hour: string): string {
    return this.isCompact() && index % 2 === 1 ? '' : hour;
  }

  private get sourceData(): UvPoint[] {
    return this.data.length > 0 ? this.data : DEFAULT_UV_DATA;
  }

  private getAppearance(uvIndex: number): UvLevelAppearance {
    if (uvIndex <= 2) {
      return {
        label: 'Bajo',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        textColor: '#10B981'
      };
    }

    if (uvIndex <= 5) {
      return {
        label: 'Moderado',
        backgroundColor: 'rgba(255, 209, 102, 0.2)',
        textColor: '#FFD166'
      };
    }

    if (uvIndex <= 7) {
      return {
        label: 'Alto',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        textColor: '#F97316'
      };
    }

    if (uvIndex <= 10) {
      return {
        label: 'Muy alto',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        textColor: '#EF4444'
      };
    }

    return {
      label: 'Extremo',
      backgroundColor: 'rgba(147, 51, 234, 0.2)',
      textColor: '#9333EA'
    };
  }
}
