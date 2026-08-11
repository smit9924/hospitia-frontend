import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { timer } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { Banner } from '../../common/banner/banner';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import {
  ConfirmPasswordMatcher,
  passwordConfirmationValidator,
} from '../../../directives/validators/password-confirmation/password-confirmation';
import { passwordStrengthValidator } from '../../../directives/validators/password-strength-check/password-strength-check';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    Banner,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit, AfterViewInit {
  private authService = inject(Auth);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected confirmPasswordMatcher = new ConfirmPasswordMatcher();
  protected passwordMustBeLabel = $localize`Password must be`;

  appRoutes = appRoutes;
  resetToken = '';

  resetPasswordForm = new FormGroup(
    {
      newPassword: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      confirmNewPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [passwordConfirmationValidator('newPassword', 'confirmNewPassword')],
    },
  );

  showNewPassword = signal(false);
  showConfirmNewPassword = signal(false);
  passwordReset = signal(false);
  showRequestNewLink = signal(false);
  bannerMessage = '';

  showNewPasswordLabel = $localize`Show new password`;
  hideNewPasswordLabel = $localize`Hide new password`;
  showConfirmNewPasswordLabel = $localize`Show confirm new password`;
  hideConfirmNewPasswordLabel = $localize`Hide confirm new password`;

  @ViewChild('resetPasswordBanner') banner!: Banner;

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  ngAfterViewInit(): void {
    if (!this.resetToken) {
      this.resetPasswordForm.disable();
      this.showRequestNewLink.set(true);
      this.bannerMessage = $localize`This password reset link is missing or invalid. Please request a new link.`;
      this.showBanner(this.bannerMessage);
    }
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmNewPasswordVisibility(): void {
    this.showConfirmNewPassword.update((value) => !value);
  }

  resetPassword(): void {
    const newPassword = this.resetPasswordForm?.value?.newPassword;
    const confirmNewPassword = this.resetPasswordForm?.value?.confirmNewPassword;

    if (!this.resetToken) {
      this.showRequestNewLink.set(true);
      this.showBanner(
        $localize`This password reset link is missing or invalid. Please request a new link.`,
      );
      return;
    }

    if (this.resetPasswordForm.valid && newPassword != null && confirmNewPassword != null) {
      this.authService.resetPassword(this.resetToken, newPassword).subscribe({
        next: () => {
          this.passwordReset.set(true);
          this.showSuccessSnackbar();
          this.scheduleLoginRedirect();
        },
        error: (error: HttpErrorResponse) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;

          if (error.status === HttpStatusCode.UnprocessableEntity) {
            this.showRequestNewLink.set(false);
            this.showBanner(
              $localize`Please ensure all fields are filled out correctly before submitting the form.`,
            );
          } else if (errorRes?.errorCode === ErrorCodes.INVALIDTOKEN) {
            this.showRequestNewLink.set(true);
            this.showBanner(
              $localize`This password reset link is invalid or has expired. Please request a new link.`,
            );
          } else if (errorRes?.errorCode === ErrorCodes.WEAK_PASSWORD) {
            this.showRequestNewLink.set(false);
            this.showBanner(
              $localize`The new password you entered is too weak. Please choose a stronger password.`,
            );
          } else {
            throw error;
          }
        },
      });
    } else {
      this.dialogService.openOkDialog(
        $localize`Password Reset Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
    }
  }

  async redirectToLogin(): Promise<void> {
    await this.router.navigateByUrl(this.appRoutes.login);
  }

  private scheduleLoginRedirect(): void {
    timer(3000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async () => {
        await this.redirectToLogin();
      });
  }

  private showSuccessSnackbar(): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: $localize`Password reset successfully!`,
      type: GenericSnackbarType.SUCCESS,
    });

    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });

    this.snackbarService.open(snackbarConfig);
  }

  private showBanner(message: string, type: BANNER_TYPES = BANNER_TYPES.ERROR): void {
    this.bannerMessage = message;
    this.banner.type = type;
    this.banner.show();
  }
}
