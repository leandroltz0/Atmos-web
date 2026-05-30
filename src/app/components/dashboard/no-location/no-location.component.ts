import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard-no-location',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './no-location.component.html',
  styleUrl: './no-location.component.scss'
})
export class DashboardNoLocationComponent {
  readonly searchCity = output<void>();

  protected onSearch(): void {
    this.searchCity.emit();
  }
}
