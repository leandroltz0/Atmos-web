import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

import { CityItem } from '../../../core/services/cities.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [MatButtonModule, MatRippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent {
  readonly results = input.required<CityItem[]>();
  readonly favoriteMap = input.required<Record<string, string>>();

  readonly selectCity = output<CityItem>();
  readonly toggleFavorite = output<{ city: CityItem; event: Event }>();

  protected isFavorite(city: CityItem): boolean {
    const key = `${city.name}|${city.country}|${city.lat}|${city.lon}`;
    return key in this.favoriteMap();
  }

  protected onSelect(city: CityItem): void {
    this.selectCity.emit(city);
  }

  protected onToggleFavorite(city: CityItem, event: Event): void {
    this.toggleFavorite.emit({ city, event });
  }
}
