import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class DashboardBackgroundComponent {}
