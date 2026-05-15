import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type UvLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

@Component({
  selector: 'app-uv-badge',
  standalone: true,
  templateUrl: './uv-badge.component.html',
  styleUrl: './uv-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UvBadgeComponent {
  @Input() level: UvLevel = 'high';

  protected get label(): string {
    switch (this.level) {
      case 'moderate':
        return 'Moderado';
      case 'high':
        return 'Alto';
      case 'very-high':
        return 'Muy alto';
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
        return '#FFD16633';
      case 'high':
        return '#F9731633';
      case 'very-high':
        return '#EF444433';
      case 'extreme':
        return '#9333EA33';
      case 'low':
      default:
        return '#10B98133';
    }
  }

  protected get textColor(): string {
    switch (this.level) {
      case 'moderate':
        return '#FFD166';
      case 'high':
        return '#F97316';
      case 'very-high':
        return '#EF4444';
      case 'extreme':
        return '#9333EA';
      case 'low':
      default:
        return '#10B981';
    }
  }
}
