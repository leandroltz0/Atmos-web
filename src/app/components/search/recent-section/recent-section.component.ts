import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { SearchHistoryEntry } from '../../../core/models/favorite.model';

@Component({
  selector: 'app-search-recent-section',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-section.component.html',
  styleUrl: './recent-section.component.scss'
})
export class SearchRecentSectionComponent {
  readonly recent = input.required<SearchHistoryEntry[]>();

  readonly selectRecent = output<SearchHistoryEntry>();
  readonly clearRecent = output<void>();

  protected onSelect(item: SearchHistoryEntry): void {
    this.selectRecent.emit(item);
  }

  protected onClear(): void {
    this.clearRecent.emit();
  }
}
