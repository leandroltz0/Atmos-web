import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type UvLevel = 'low' | 'moderate' | 'high' | 'extreme';

@Component({
  selector: 'app-uv-badge',
  standalone: true,
  templateUrl: './uv-badge.component.html',
  styleUrl: './uv-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UvBadgeComponent {
  @Input() level: UvLevel = 'low';

  protected get label(): string {
    switch (this.level) {
      case 'moderate':
        return 'Moderado';
      case 'high':
        return 'Alto';
      case 'extreme':
        return 'Extremo';
      case 'low':
      default:
        return 'Bajo';
    }
  }

  protected get backgroundColor(): string {
    switch (this.level) {
      case 'moderate':
        return '#FACC1533';
      case 'high':
        return '#FB923C33';
      case 'extreme':
        return '#F8717133';
      case 'low':
      default:
        return '#4ADE8033';
    }
  }

  protected get textColor(): string {
    switch (this.level) {
      case 'moderate':
        return '#FACC15';
      case 'high':
        return '#FB923C';
      case 'extreme':
        return '#F87171';
      case 'low':
      default:
        return '#4ADE80';
    }
  }
}
