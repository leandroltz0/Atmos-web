import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-weekly-item',
  standalone: true,
  templateUrl: './weekly-item.component.html',
  styleUrl: './weekly-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyItemComponent {
  @Input({ required: true }) day = '';
  @Input({ required: true }) icon = '';
  @Input({ required: true }) min = 0;
  @Input({ required: true }) max = 0;
  @Input({ required: true }) rain = 0;
}
