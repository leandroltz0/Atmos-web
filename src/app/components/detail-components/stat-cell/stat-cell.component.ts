import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-cell',
  standalone: true,
  templateUrl: './stat-cell.component.html',
  styleUrl: './stat-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCellComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() unit?: string;
}
