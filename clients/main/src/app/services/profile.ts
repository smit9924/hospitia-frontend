import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserProfileDto } from '../types/interfaces/users';
import { UserProfileModel } from '../types/models/users/user-profile-model';
import { ApiErrorResponse } from '../types/interfaces/common';
import { ErrorCodes } from '../types/enums/error-codes';
import { apiRoutes } from '../data/api-routes';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private userProfile: UserProfileModel | null = null;

  async fetchProfile() {
    await this.http.get<UserProfileDto>(apiRoutes.users.profile).subscribe({
      next: (data) => {
        this.userProfile = new UserProfileModel(data);
      },
      error: (error) => {
        const errorRes = error.error as ApiErrorResponse<unknown>;
        if (errorRes.errorCode === ErrorCodes.USER_NOT_FOUND) {
          console.error('User not found');
        } else {
          throw error;
        }
      },
    });
  }

  get profile(): UserProfileModel | null {
    return this.userProfile;
  }
}
