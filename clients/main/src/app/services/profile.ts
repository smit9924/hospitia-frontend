import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { UserProfileDto, UserProfileUpdate } from '../types/interfaces/users';
import { UserProfileModel } from '../types/models/users/user-profile-model';
import { ApiErrorResponse } from '../types/interfaces/common';
import { ErrorCodes } from '../types/enums/error-codes';
import { apiRoutes } from '../data/api-routes';
import { Router } from '@angular/router';
import { appRoutes } from '../data/app-routes';
import { UserType } from '../types/enums/auth';
import { catchError, firstValueFrom, map, Observable, tap, throwError } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);
  private _userProfile = signal<UserProfileModel | null>(null);
  userProfile = this._userProfile.asReadonly();
  private router: Router = inject(Router);
  private authService: Auth = inject(Auth);

  constructor() {
    // Clear the profile data when the user logs out.
    effect(() => {
      if (this.authService.isLoggedOut) {
        this.clearProfile();
      }
    });
  }

  async loadProfile(): Promise<void> {
    if (this.authService.isLoggedIn) {
      await firstValueFrom(this.fetchProfile());
    }
  }

  private fetchProfile(): Observable<UserProfileModel> {
    return this.http.get<UserProfileDto>(apiRoutes.users.profile).pipe(
      map((data) => new UserProfileModel(data)),

      tap((profile) => {
        this._userProfile.set(profile);
      }),

      catchError((error: HttpErrorResponse) => {
        const errorRes = error.error as ApiErrorResponse<unknown>;

        if (errorRes?.errorCode === ErrorCodes.USER_NOT_FOUND) {
          this.authService.logout();
        }

        return throwError(() => error);
      }),
    );
  }

  updateProfile(userProfileUpate: UserProfileUpdate): Observable<UserProfileDto> {
    return this.http.post<UserProfileDto>(apiRoutes.users.profile, userProfileUpate);
  }

  updateProfileData(profileData: UserProfileModel): void {
    this._userProfile.set(profileData);
  }

  clearProfile(): void {
    this._userProfile.set(null);
  }

  async getDefaultHomeRouteForUser(): Promise<string> {
    const profileData = this.userProfile();

    // If theuser profile is null, the user should be logged out.
    // Once logged out, no further action is required, and the login route will be returned by default.
    if (profileData === null) {
      return appRoutes.login;
    }

    switch (profileData.role) {
      case UserType.ADMIN: {
        return appRoutes.adminDashboard;
      }

      case UserType.OWNER: {
        return appRoutes.ownerDashboard;
      }

      case UserType.MANAGER: {
        return appRoutes.managerDashboard;
      }

      case UserType.CUSTOMER: {
        return appRoutes.customerDashboard;
      }

      default: {
        return appRoutes.login;
      }
    }
  }

  async redirectToDefaultHome(): Promise<void> {
    const defaultRoute = await this.getDefaultHomeRouteForUser();
    await this.router.navigateByUrl(defaultRoute);
  }

  userRoleLabel = computed(() => {
    const profileData = this.userProfile();

    if (!profileData) {
      return '-';
    }

    const role = profileData.role;

    switch (role) {
      case UserType.ADMIN: {
        return $localize`Admin`;
      }

      case UserType.OWNER: {
        return $localize`Owner`;
      }

      case UserType.MANAGER: {
        return $localize`Manager`;
      }

      case UserType.CUSTOMER: {
        return $localize`Customer`;
      }

      default: {
        return '-';
      }
    }
  });

  userFullName = computed(() => {
    const profileData = this.userProfile();

    if (profileData === null) {
      return '-';
    }

    const firstName = profileData.firstName ?? '';
    const lastName = profileData.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    // If full name is not available, fallback to username.
    return '-';
  });
}
