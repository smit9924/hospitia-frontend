import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { Banner } from '../../common/banner/banner';
import { CommonModule, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { ConfirmPasswordMatcher } from '../../../directives/validators/password-confirmation/password-confirmation';
import { usernameAvailabilityValidator } from '../../../directives/validators/username-availability/username-availability';
import { Profile } from '../../../services/profile';
import { passwordStrengthValidator } from '../../../directives/validators/password-strength-check/password-strength-check';
import { Auth } from '../../../services/auth';
import { LoginApiResponse } from '../../../types/models/auth/login-api-response';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { usernameValidator } from '../../../directives/validators/username/username';
import { User } from '../../../services/user/user';
import { environment } from '../../../../environments/environment';
import { UserType } from '../../../types/enums/auth';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    RouterLink,
    MatTooltipModule,
    Banner,
    DecimalPipe,
    NgTemplateOutlet,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private profileService = inject(Profile);
  private userService = inject(User);
  private authService = inject(Auth);
  @ViewChild('signupBanner') banner!: Banner;
  protected readonly appRoutes = appRoutes;
  protected readonly enableOwnerSignup = environment.enableOwnerSignup;
  protected readonly UserType = UserType;
  protected readonly selectedUserType = signal(UserType.CUSTOMER);
  protected confirmPasswordMatcher = new ConfirmPasswordMatcher();
  protected firstNameMaxLength = 50;
  protected lastNameMaxLength = 50;
  protected usernameMaxLength = 50;
  protected showPassword = false;
  protected bannerMessage = '';
  protected usernameMustBeLabel = $localize`Username`;
  protected passwordMustBeLabel = $localize`Password must be`;
  signupForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(this.firstNameMaxLength),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(this.lastNameMaxLength),
    ]),
    username: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(this.usernameMaxLength),
        usernameValidator(),
      ],
      [usernameAvailabilityValidator(this.profileService, this.userService).bind(this)],
    ),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
  });

  onTabChange(index: number): void {
    this.selectedUserType.set(index === 0 ? UserType.CUSTOMER : UserType.OWNER);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signup(): void {
    const firstName = this.signupForm?.value?.firstName;
    const lastName = this.signupForm?.value?.lastName;
    const email = this.signupForm?.value?.email;
    const username = this.signupForm?.value?.username;
    const password = this.signupForm?.value?.password;
    const userType = this.enableOwnerSignup ? this.selectedUserType() : UserType.CUSTOMER;

    if (
      this.signupForm.valid &&
      firstName != null &&
      lastName != null &&
      email != null &&
      username != null &&
      password != null
    ) {
      this.authService
        .signup(
          {
            firstName,
            lastName,
            email,
            username,
            password,
          },
          userType,
        )
        .subscribe({
          next: async (data) => {
            const dataObj = new LoginApiResponse(data);
            this.authService.setLoginSession(dataObj);
            await this.profileService.loadProfile();
            await this.profileService.redirectToDefaultHome();
            this.showSuccessSnackbar();
          },
          error: (error: HttpErrorResponse) => {
            const errorRes = error.error as ApiErrorResponse<unknown>;
            if (error.status === HttpStatusCode.UnprocessableEntity) {
              this.showBanner(
                $localize`Please ensure all fields are filled out correctly before submitting the form.`,
              );
            } else {
              if (errorRes.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
                this.showBanner(
                  $localize`Username is already taken. Please choose a different username.`,
                );
              } else if (errorRes.errorCode === ErrorCodes.USER_WITH_EMAIL_ALREADY_EXIST) {
                this.showBanner(
                  $localize`Email is already registered. Please use a different email.`,
                );
              } else if (errorRes.errorCode === ErrorCodes.WEAK_PASSWORD) {
                this.showBanner(
                  $localize`Password is too weak. Please choose a stronger password.`,
                );
              } else {
                throw error;
              }
            }
          },
        });
    } else {
      this.dialogService.openOkDialog(
        $localize`Signup Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
    }
  }

  private showSuccessSnackbar(): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: $localize`Signup successful! Redirecting...`,
      type: GenericSnackbarType.SUCCESS,
    });
    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });
    this.snackbarService.open(snackbarConfig);
  }

  showComingSoonPopup(): void {
    this.dialogService.openOkDialog(
      $localize`Coming Soon`,
      $localize`Social signup will be soon available.`,
    );
  }

  private showBanner(message: string, type: BANNER_TYPES = BANNER_TYPES.ERROR): void {
    this.bannerMessage = message;
    this.banner.type = type;
    this.banner.show();
  }
}
