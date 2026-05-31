import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

import { FavoriteCity } from '../../../core/models/favorite.model';

@Component({
  selector: 'app-search-favorites-section',
  standalone: true,
  imports: [MatButtonModule, MatRippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favorites-section.component.html',
  styleUrl: './favorites-section.component.scss'
})
export class SearchFavoritesSectionComponent {
  readonly favorites = input.required<FavoriteCity[]>();
  readonly isLoading = input.required<boolean>();
  readonly error = input<string | null>();

  readonly selectFavorite = output<FavoriteCity>();
  readonly removeFavorite = output<{ fav: FavoriteCity; event: Event }>();
  readonly retry = output<void>();

  protected onSelect(fav: FavoriteCity): void {
    this.selectFavorite.emit(fav);
  }

  protected onRemove(fav: FavoriteCity, event: Event): void {
    this.removeFavorite.emit({ fav, event });
  }

  protected onRetry(): void {
    this.retry.emit();
  }
}
