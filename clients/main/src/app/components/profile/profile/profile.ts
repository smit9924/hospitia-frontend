import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { MatCardModule } from '@angular/material/card';
import { NgOptimizedImage } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { Profile as ProfileService } from '../../../services/profile';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Dialog } from '../../../services/dialog';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { Snackbar } from '../../../services/snackbar';
import { Banner } from '../../common/banner/banner';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { usernameAvailabilityValidator } from '../../../directives/validators/username-availability/username-availability';
import { User } from '../../../services/user/user';

@Component({
  selector: 'app-profile',
  imports: [
    MatCardModule,
    SecondaryNavbar,
    NgOptimizedImage,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    Banner,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  protected profileService = inject(ProfileService);
  protected userService = inject(User);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  protected titleText = $localize`Profile`;
  protected editMode = signal(false);
  userProfileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    username: new FormControl(
      '',
      [Validators.required],
      usernameAvailabilityValidator(this.profileService, this.userService).bind(this),
    ),
  });
  bannerMessage = '';
  @ViewChild('profileBanner') banner!: Banner;

  constructor() {
    // Mark form as disabled initially
    this.userProfileForm.disable();

    this.updateProfileFormData();
  }

  private updateProfileFormData(): void {
    // Use effect to automatically update the form data whenever the user profile data changes.
    effect(() => {
      this.syncFormData();
    });
  }

  private syncFormData(): void {
    const profileData = this.profileService.userProfile();

    if (profileData) {
      this.userProfileForm.patchValue({
        firstName: profileData.firstName ?? '',
        lastName: profileData.lastName ?? '',
        username: profileData.username ?? '',
      });
    }
  }

  updateProfile(): void {
    const username = this.userProfileForm?.value?.username;
    const firstName = this.userProfileForm?.value?.firstName;
    const lastName = this.userProfileForm?.value?.lastName;
    if (this.userProfileForm.valid && username != null && firstName != null && lastName != null) {
      this.profileService
        .updateProfile({
          username: username,
          firstName: firstName,
          lastName: lastName,
        })
        .subscribe({
          next: async (data) => {
            const dataObj = new UserProfileModel(data);
            this.profileService.updateProfileData(dataObj);
            this.showSnackbar($localize`Profile data updated successfully`);
            this.toggleEditMode();
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === HttpStatusCode.UnprocessableEntity) {
              this.showBanner($localize`Please enter valid data in the fields and try again.`);
            } else {
              const errorRes = error.error as ApiErrorResponse<unknown>;
              if (errorRes.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
                this.showBanner(
                  $localize`Username already exists. Please choose a different username.`,
                );
              } else if (errorRes.errorCode === ErrorCodes.USER_NOT_FOUND) {
                this.dialogService.openOkDialog(
                  $localize`Unexpected Error`,
                  $localize`We couldn't find your user profile. Please try logging out and logging back in. If the issue persists, contact support.`,
                );
              } else {
                throw error;
              }
            }
          },
        });
    } else {
      this.dialogService.openOkDialog(
        $localize`Invalid Input`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
    }
  }

  protected toggleEditMode(): void {
    this.editMode.update((value) => !value);

    if (this.editMode()) {
      this.userProfileForm.enable();
    } else {
      this.userProfileForm.disable();
    }
  }

  protected cancelEdit(): void {
    this.toggleEditMode();
    this.syncFormData();
  }

  private showSnackbar(
    text: string,
    type: GenericSnackbarType = GenericSnackbarType.SUCCESS,
  ): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: text,
      type: type,
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
