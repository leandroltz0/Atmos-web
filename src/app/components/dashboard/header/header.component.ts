import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class DashboardHeaderComponent {
  readonly cityName = input.required<string>();
  readonly country = input<string>('');
  readonly formattedDate = input.required<string>();
  readonly minutesAgo = input.required<number>();
  readonly isOffline = input.required<boolean>();
  readonly isLoading = input.required<boolean>();

  readonly refresh = output<void>();

  protected onRefresh(): void {
    this.refresh.emit();
  }
}
