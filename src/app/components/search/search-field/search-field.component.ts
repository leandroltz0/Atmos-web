import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss'
})
export class SearchFieldComponent {
  readonly queryControl = input.required<FormControl<string>>();
  readonly hasQuery = input.required<boolean>();

  readonly clear = output<void>();

  protected onClear(): void {
    this.clear.emit();
  }
}
