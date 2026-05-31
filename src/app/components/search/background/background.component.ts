import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class SearchBackgroundComponent {}
