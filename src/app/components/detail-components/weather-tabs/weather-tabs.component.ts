import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-weather-tabs',
  standalone: true,
  imports: [MatTabsModule],
  templateUrl: './weather-tabs.component.html',
  styleUrl: './weather-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherTabsComponent {
  @Input() selectedIndex = 0;
  @Output() readonly selectedIndexChange = new EventEmitter<number>();

  protected onSelectedIndexChange(index: number): void {
    this.selectedIndexChange.emit(index);
  }
}
