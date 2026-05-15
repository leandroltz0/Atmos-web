import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AqiDotComponent } from '../aqi-dot';
import { SectionCardComponent } from '../section-card';

type AqiStatus = {
  label: string;
  color: string;
};

@Component({
  selector: 'app-aqi-panel',
  standalone: true,
  imports: [SectionCardComponent, AqiDotComponent],
  templateUrl: './aqi-panel.component.html',
  styleUrl: './aqi-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AqiPanelComponent {
  @Input() aqi = 0;
  @Input() pm25 = 0;
  @Input() pm10 = 0;
  @Input() o3 = 0;
  @Input() no2 = 0;

  protected get aqiStatus(): AqiStatus {
    if (this.aqi <= 50) {
      return { label: 'Bueno', color: '#10B981' };
    }

    if (this.aqi <= 100) {
      return { label: 'Moderado', color: '#FACC15' };
    }

    if (this.aqi <= 150) {
      return { label: 'Malo', color: '#FB923C' };
    }

    return { label: 'Muy malo', color: '#F87171' };
  }
}
