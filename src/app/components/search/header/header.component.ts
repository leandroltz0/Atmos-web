import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class SearchHeaderComponent {}
