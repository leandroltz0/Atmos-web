import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';
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

  protected readonly mode = signal<AuthMode>('signin');
  protected readonly isSubmitting = signal(false);
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

    this.mode.set(mode);
  }

  protected submit(): void {
    const activeForm = this.mode() === 'signin' ? this.signInForm : this.signUpForm;
    activeForm.markAllAsTouched();

    if (activeForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    window.setTimeout(() => {
      this.isSubmitting.set(false);
      void this.router.navigate([`/${APP_ROUTE_PATHS.allowLocation}`]);
    }, 900);
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
}
