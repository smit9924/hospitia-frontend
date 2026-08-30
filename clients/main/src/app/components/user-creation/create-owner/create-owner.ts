import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { filter, finalize, switchMap } from 'rxjs';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { Banner } from '../../common/banner/banner';
import { appRoutes } from '../../../data/app-routes';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { User } from '../../../services/user/user';
import { Profile } from '../../../services/profile';
import { usernameAvailabilityValidator } from '../../../directives/validators/username-availability/username-availability';
import { usernameValidator } from '../../../directives/validators/username/username';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { UserCreateRequest, UserUpdateRequest } from '../../../types/interfaces/users';

type OwnerForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
}>;

@Component({
  selector: 'app-create-owner',
  imports: [
    SecondaryNavbar,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    Banner,
    DecimalPipe,
  ],
  templateUrl: './create-owner.html',
  styleUrl: './create-owner.scss',
})
export class CreateOwner implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(User);
  private readonly profileService = inject(Profile);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  @ViewChild('formBanner') banner!: Banner;

  protected readonly firstNameMaxLength = 50;
  protected readonly lastNameMaxLength = 50;
  protected readonly usernameMaxLength = 50;
  protected readonly usernameMustBeLabel = $localize`Username`;

  protected readonly guid = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.guid());
  protected readonly titleText = computed(() =>
    this.isEditMode() ? $localize`Edit Owner` : $localize`Create Owner`,
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? $localize`Save` : $localize`Create`,
  );
  protected readonly isLoadingUser = signal(false);
  protected readonly userNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showForm = computed(() => !this.isLoadingUser() && !this.userNotFound());

  protected bannerMessage = '';

  protected readonly ownerForm = this.createOwnerForm();

  ngOnInit(): void {
    const guid = this.route.snapshot.queryParamMap.get('guid');
    if (!guid) {
      return;
    }

    this.guid.set(guid);
    this.loadUser(guid);
  }

  protected onSubmit(): void {
    if (!this.ownerForm.valid) {
      this.dialogService.openOkDialog(
        $localize`Validation Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (this.isEditMode()) {
      this.confirmAndSave();
      return;
    }

    this.createUser();
  }

  private createOwnerForm(): OwnerForm {
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
    });
  }

  private loadUser(guid: string): void {
    this.isLoadingUser.set(true);
    this.userNotFound.set(false);

    this.userService
      .getOwner(guid)
      .pipe(finalize(() => this.isLoadingUser.set(false)))
      .subscribe({
        next: (user) => {
          this.ownerForm.patchValue({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            email: user.email,
            username: user.username,
          });
          this.ownerForm.controls.email.disable();
        },
        error: (error: HttpErrorResponse) => {
          if (
            error.status === HttpStatusCode.NotFound ||
            (error.error as ApiErrorResponse<unknown>)?.errorCode === ErrorCodes.USER_NOT_FOUND
          ) {
            this.userNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private createUser(): void {
    const payload: UserCreateRequest = this.ownerForm.getRawValue();

    this.isSubmitting.set(true);
    this.userService
      .createOwner(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.showSuccessSnackbar(
            $localize`Owner created successfully. A welcome email has been sent.`,
          );
          void this.router.navigateByUrl(appRoutes.ownerListing);
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private confirmAndSave(): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Confirm Changes`,
        $localize`Are you sure you want to save these changes?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => {
          const guid = this.guid();
          if (!guid) {
            throw new Error('Missing guid for edit');
          }

          const raw = this.ownerForm.getRawValue();
          const payload: UserUpdateRequest = {
            guid,
            firstName: raw.firstName,
            lastName: raw.lastName,
            username: raw.username,
          };

          this.isSubmitting.set(true);
          return this.userService
            .updateOwner(payload)
            .pipe(finalize(() => this.isSubmitting.set(false)));
        }),
      )
      .subscribe({
        next: () => {
          this.showSuccessSnackbar($localize`Owner updated successfully.`);
          void this.router.navigateByUrl(appRoutes.ownerListing);
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorRes = error.error as ApiErrorResponse<unknown>;

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
      this.showBanner($localize`Username is already taken. Please choose a different username.`);
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.USER_WITH_EMAIL_ALREADY_EXIST) {
      this.showBanner($localize`Email is already registered. Please use a different email.`);
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.USER_NOT_FOUND) {
      this.userNotFound.set(true);
      return;
    }

    throw error;
  }

  private showSuccessSnackbar(text: string): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text,
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
