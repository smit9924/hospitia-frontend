import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { APP_ROUTES } from '../../../data/app-routes';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Auth } from '../../../services/auth';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { LoginApiResponse } from '../../../types/models/auth/login-api-response';
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
import { Profile } from '../../../services/profile';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    RouterLink,
    MatTooltipModule,
    Banner,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(Auth);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private profileService = inject(Profile);
  APP_ROUTES = APP_ROUTES;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });
  showPassword = false;
  bannerMessage = '';
  @ViewChild('loginBanner') banner!: Banner;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    const email = this.loginForm?.value?.email;
    const password = this.loginForm?.value?.password;
    const rememberMe = this.loginForm?.value?.rememberMe;

    if (this.loginForm.valid && email != null && password != null && rememberMe != null) {
      this.authService.login(email, password, rememberMe).subscribe({
        next: async (data) => {
          const dataObj = new LoginApiResponse(data);
          this.authService.setLoginSession(dataObj);
          this.showSuccessSnackbar();
          await this.profileService.fetchProfile();
        },
        error: (error) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;
          if (errorRes.errorCode === ErrorCodes.INVALID_CREDENTIALS) {
            this.showBanner($localize`Invalid email or password. Please try again.`);
          } else {
            throw error;
          }
        },
      });
    } else {
      this.dialogService.openOkDialog(
        $localize`Login Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
    }
  }

  private showSuccessSnackbar(): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: $localize`Login successful!`,
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
