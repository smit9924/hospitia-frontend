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
import { UserSignup } from '../../../types/interfaces/users';

type SignupForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}>;

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
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);
  private readonly profileService = inject(Profile);
  private readonly userService = inject(User);
  private readonly authService = inject(Auth);

  @ViewChild('signupBanner') banner!: Banner;

  protected readonly appRoutes = appRoutes;
  protected readonly enableOwnerSignup = environment.enableOwnerSignup;
  protected readonly UserType = UserType;
  protected readonly selectedUserType = signal(UserType.CUSTOMER);
  protected readonly firstNameMaxLength = 50;
  protected readonly lastNameMaxLength = 50;
  protected readonly usernameMaxLength = 50;
  protected readonly usernameMustBeLabel = $localize`Username`;
  protected readonly passwordMustBeLabel = $localize`Password must be`;
  protected showCustomerPassword = false;
  protected showOwnerPassword = false;
  protected bannerMessage = '';

  readonly customerSignupForm = this.createSignupForm();
  readonly ownerSignupForm = this.createSignupForm();

  onTabChange(index: number): void {
    this.selectedUserType.set(index === 0 ? UserType.CUSTOMER : UserType.OWNER);
  }

  toggleCustomerPasswordVisibility(): void {
    this.showCustomerPassword = !this.showCustomerPassword;
  }

  toggleOwnerPasswordVisibility(): void {
    this.showOwnerPassword = !this.showOwnerPassword;
  }

  signupCustomer(): void {
    if (!this.customerSignupForm.valid) {
      this.dialogService.openOkDialog(
        $localize`Signup Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    const payload: UserSignup = this.customerSignupForm.getRawValue();

    this.authService.signupCustomer(payload).subscribe({
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
          return;
        }

        if (errorRes.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
          this.showBanner(
            $localize`Username is already taken. Please choose a different username.`,
          );
          return;
        }

        if (errorRes.errorCode === ErrorCodes.USER_WITH_EMAIL_ALREADY_EXIST) {
          this.showBanner(
            $localize`Email is already registered. Please use a different email.`,
          );
          return;
        }

        if (errorRes.errorCode === ErrorCodes.WEAK_PASSWORD) {
          this.showBanner(
            $localize`Password is too weak. Please choose a stronger password.`,
          );
          return;
        }

        throw error;
      },
    });
  }

  signupOwner(): void {
    if (!this.ownerSignupForm.valid) {
      this.dialogService.openOkDialog(
        $localize`Signup Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    const payload: UserSignup = this.ownerSignupForm.getRawValue();

    this.authService.signupOwner(payload).subscribe({
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
          return;
        }

        if (errorRes.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
          this.showBanner(
            $localize`Username is already taken. Please choose a different username.`,
          );
          return;
        }

        if (errorRes.errorCode === ErrorCodes.USER_WITH_EMAIL_ALREADY_EXIST) {
          this.showBanner(
            $localize`Email is already registered. Please use a different email.`,
          );
          return;
        }

        if (errorRes.errorCode === ErrorCodes.WEAK_PASSWORD) {
          this.showBanner(
            $localize`Password is too weak. Please choose a stronger password.`,
          );
          return;
        }

        throw error;
      },
    });
  }

  showComingSoonPopup(): void {
    this.dialogService.openOkDialog(
      $localize`Coming Soon`,
      $localize`Social signup will be soon available.`,
    );
  }

  private createSignupForm(): SignupForm {
    return new FormGroup({
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(this.firstNameMaxLength),
        ],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(this.lastNameMaxLength),
        ],
      }),
      username: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(this.usernameMaxLength),
            usernameValidator(),
          ],
        },
        [usernameAvailabilityValidator(this.profileService, this.userService).bind(this)],
      ) as FormControl<string>,
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, passwordStrengthValidator()],
      }),
    });
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

  private showBanner(message: string, type: BANNER_TYPES = BANNER_TYPES.ERROR): void {
    this.bannerMessage = message;
    this.banner.type = type;
    this.banner.show();
  }
}
