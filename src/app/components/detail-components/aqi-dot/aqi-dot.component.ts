import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-aqi-dot',
  standalone: true,
  templateUrl: './aqi-dot.component.html',
  styleUrl: './aqi-dot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AqiDotComponent {
  @Input() value = 0;
  @Input() label = '';

  protected getColor(value: number): string {
    if (value <= 50) {
      return '#4ADE80';
    }

    if (value <= 100) {
      return '#FACC15';
    }

    if (value <= 150) {
      return '#FB923C';
    }

    return '#F87171';
  }
}
