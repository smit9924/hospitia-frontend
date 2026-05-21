import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserProfileDto } from '../types/interfaces/users';
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
  private userProfile: UserProfileModel | null = null;
  private router: Router = inject(Router);
  private authService: Auth = inject(Auth);

  fetchProfile(): Observable<UserProfileModel> {
    return this.http.get<UserProfileDto>(apiRoutes.users.profile).pipe(
      map((data) => new UserProfileModel(data)),

      tap((profile) => {
        this.userProfile = profile;
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

  async getProfile(): Promise<UserProfileModel | null> {
    if (this.userProfile === null && this.authService.isLoggedIn) {
      await firstValueFrom(this.fetchProfile());
    }
    return this.userProfile;
  }

  clearProfile() {
    this.userProfile = null;
  }

  async getDefaultHomeRouteForUser(): Promise<string> {
    const profileData = await this.getProfile();

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
}
