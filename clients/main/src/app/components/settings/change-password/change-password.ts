import { Component, inject, signal, ViewChild } from '@angular/core';
import { Snackbar } from '../../../services/snackbar';
import { Router } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner } from '../../common/banner/banner';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../services/user/user';
import {
  ConfirmPasswordMatcher,
  passwordConfirmationValidator,
} from '../../../directives/validators/password-confirmation/password-confirmation';
import { passwordStrengthValidator } from '../../../directives/validators/password-strength-check/password-strength-check';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { Dialog } from '../../../services/dialog';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-change-password',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    Banner,
    SecondaryNavbar,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  private userService = inject(User);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private router = inject(Router);
  protected confirmPasswordMatcher = new ConfirmPasswordMatcher();
  protected passwordMustBeLabel = $localize`Password must be`;

  appRoutes = appRoutes;

  changePasswordForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      confirmNewPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [passwordConfirmationValidator('newPassword', 'confirmNewPassword')],
    },
  );

  showPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmNewPassword = signal(false);
  passwordChanged = signal(false);
  bannerMessage = '';

  showPasswordLabel = $localize`Show password`;
  hidePasswordLabel = $localize`Hide password`;
  showNewPasswordLabel = $localize`Show new password`;
  hideNewPasswordLabel = $localize`Hide new password`;
  showConfirmNewPasswordLabel = $localize`Show confirm new password`;
  hideConfirmNewPasswordLabel = $localize`Hide confirm new password`;
  titleText = $localize`Change Password`;

  @ViewChild('confirmPasswordBanner') banner!: Banner;

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmNewPasswordVisibility(): void {
    this.showConfirmNewPassword.update((value) => !value);
  }

  changePassword(): void {
    const currentPassword = this.changePasswordForm.value.password;
    const newPassword = this.changePasswordForm.value.newPassword;
    const confirmNewPassword = this.changePasswordForm.value.confirmNewPassword;

    if (
      this.changePasswordForm.valid &&
      currentPassword != null &&
      newPassword != null &&
      confirmNewPassword != null
    ) {
      this.userService.changePassword({ currentPassword, newPassword }).subscribe({
        next: () => {
          this.passwordChanged.set(true);
          this.showSuccessSnackbar();
        },
        error: (error: HttpErrorResponse) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;
          if (error.status === HttpStatusCode.UnprocessableEntity) {
            this.showBanner(
              $localize`Please ensure all fields are filled out correctly before submitting the form.`,
            );
          } else {
            if (errorRes?.errorCode === ErrorCodes.INVALID_CREDENTIALS) {
              this.showBanner(
                $localize`The current password you entered is incorrect. Please try again.`,
              );
            } else if (errorRes?.errorCode === ErrorCodes.WEAK_PASSWORD) {
              this.showBanner(
                $localize`The new password you entered is too weak. Please choose a stronger password.`,
              );
            } else if (errorRes?.errorCode === ErrorCodes.USER_NOT_FOUND) {
              this.showBanner(
                $localize`User not found. Please ensure you are logged in and try again.`,
              );
            } else {
              throw error;
            }
          }
        },
      });
    } else {
      this.dialogService.openOkDialog(
        $localize`Change Password Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
    }
  }

  redirectToSettings(): void {
    this.router.navigateByUrl(this.appRoutes.settings);
  }

  private showSuccessSnackbar(): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: $localize`Password changed successfully!`,
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
