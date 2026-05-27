import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { finalize } from 'rxjs';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { gsap } from 'gsap';

import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { AuthService, LoginResponse } from '../../core/services/auth.service';
import { AuthPreviewPanelComponent } from './components/auth-preview-panel/auth-preview-panel.component';

type AuthMode = 'signin' | 'signup';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AuthPreviewPanelComponent
  ],
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPage implements AfterViewInit {
  @ViewChild('shell', { static: true }) private readonly shellRef!: ElementRef<HTMLElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly mode = signal<AuthMode>('signup');
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly hideSignInPassword = signal(true);
  protected readonly hideSignUpPassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

  protected readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true]
  });

  protected readonly signUpForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    termsAccepted: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  ngAfterViewInit(): void {
    const root = this.shellRef.nativeElement;

    gsap.set(root.querySelectorAll('.auth-reveal'), {
      opacity: 0,
      y: 24
    });

    gsap.to(root.querySelectorAll('.auth-reveal'), {
      opacity: 1,
      y: 0,
      duration: 0.72,
      ease: 'power3.out',
      stagger: 0.08
    });
  }

  protected setMode(mode: AuthMode): void {
    if (this.mode() === mode || this.isSubmitting()) {
      return;
    }

    this.submitError.set(null);
    this.mode.set(mode);
  }

  protected submit(): void {
    const activeForm = this.mode() === 'signin' ? this.signInForm : this.signUpForm;
    activeForm.markAllAsTouched();

    if (activeForm.invalid || this.isSubmitting()) {
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    if (this.mode() === 'signin') {
      this.authService.login({
        email: this.signInForm.controls.email.getRawValue().trim(),
        password: this.signInForm.controls.password.getRawValue()
      }).pipe(
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: (res: LoginResponse) => {
          this.authService.saveToken(res.token);
          void this.router.navigate([`/${APP_ROUTE_PATHS.dashboard}`]);
        },
        error: (error: unknown) => {
          this.submitError.set(this.getRequestErrorMessage(
            error,
            'No se pudo iniciar sesión. Revisá tus credenciales o el backend.'
          ));
        }
      });

      return;
    }

    this.authService.register({
      name: this.signUpForm.controls.fullName.getRawValue().trim(),
      email: this.signUpForm.controls.email.getRawValue().trim(),
      password: this.signUpForm.controls.password.getRawValue()
    }).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (res: LoginResponse) => {
        this.authService.saveToken(res.token);
        void this.router.navigate([`/${APP_ROUTE_PATHS.dashboard}`]);
      },
      error: (error: unknown) => {
        this.submitError.set(this.getRequestErrorMessage(
          error,
          'No se pudo crear la cuenta. Revisá los datos o el backend.'
        ));
      }
    });
  }

  protected continueWithGoogle(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    window.setTimeout(() => {
      this.isSubmitting.set(false);
      void this.router.navigate([`/${APP_ROUTE_PATHS.allowLocation}`]);
    }, 700);
  }

  protected toggleSignInPasswordVisibility(): void {
    this.hideSignInPassword.update((value) => !value);
  }

  protected toggleSignUpPasswordVisibility(): void {
    this.hideSignUpPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }

  protected shouldShowControlError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected getPasswordMismatchError(): boolean {
    return this.signUpForm.hasError('passwordMismatch')
      && this.shouldShowControlError(this.signUpForm.controls.confirmPassword);
  }

  private getRequestErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallbackMessage;
    }

    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.status > 0) {
      return `${fallbackMessage} (HTTP ${error.status})`;
    }

    return `${fallbackMessage} No hubo respuesta del servidor.`;
  }

  private extractBackendMessage(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const maybeMessage = 'message' in payload ? payload.message : null;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeError = 'error' in payload ? payload.error : null;
    if (typeof maybeError === 'string' && maybeError.trim()) {
      return maybeError;
    }

    return null;
  }
}
