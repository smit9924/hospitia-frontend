import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Profile } from '../../services/profile';
import { appRoutes } from '../../data/app-routes';

export const authRedirectionGuard: CanActivateFn = async (_route, _state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const profileService = inject(Profile);
  const userProfileData = profileService.userProfile();

  if (authService.isLoggedIn) {
    if (userProfileData?.role === null || userProfileData?.role === undefined) {
      // If user profile data or role is not available,
      // then consider the user as unauthorized and grand access to auth routes.
      return true;
    } else if (!userProfileData.isEmailVerified) {
      return new RedirectCommand(router.parseUrl(appRoutes.verifyEmail));
    } else {
      const defaultHomeRoute = await profileService.getDefaultHomeRouteForUser();
      return new RedirectCommand(router.parseUrl(defaultHomeRoute));
    }
  } else {
    return true;
  }
};
