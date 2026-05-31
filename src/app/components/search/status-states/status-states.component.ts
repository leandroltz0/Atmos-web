import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

type SearchStatus = 'initial' | 'writing' | 'loading' | 'results' | 'no-results' | 'error' | 'offline';

@Component({
  selector: 'app-search-status-states',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-states.component.html',
  styleUrl: './status-states.component.scss'
})
export class SearchStatusStatesComponent {
  readonly status = input.required<SearchStatus>();
  readonly query = input.required<string>();

  readonly retrySearch = output<void>();

  protected onRetry(): void {
    this.retrySearch.emit();
  }
}
