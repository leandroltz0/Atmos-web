import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-weekly-header',
  standalone: true,
  templateUrl: './weekly-header.component.html',
  styleUrl: './weekly-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyHeaderComponent {}
