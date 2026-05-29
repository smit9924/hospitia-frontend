import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { Profile } from '../../services/profile';
import { UserType } from '../../types/enums/auth';
import { appRoutes } from '../../data/app-routes';

export const permissionGuard: CanActivateFn = async (route, _state) => {
  const permission: UserType[] | null | undefined = route.data?.['requiredPermission'];
  const profileService = inject(Profile);
  const router = inject(Router);
  const userProfileData = profileService.userProfile();

  if (permission === null || permission === undefined) {
    // If permission is not defined on the route, allow access by default.
    return true;
  } else if (
    userProfileData === null ||
    userProfileData === undefined ||
    userProfileData?.role === null ||
    userProfileData?.role === undefined
  ) {
    // If user profile data or role is not available, then consider the user as unauthorized and deny access.
    return new RedirectCommand(router.parseUrl(appRoutes.login));
  } else if (permission.includes(userProfileData.role)) {
    // Check if the user's role matches any of the required permissions for the route.
    return true;
  } else {
    // If user's role does not match the required permissions, deny access.
    return new RedirectCommand(router.parseUrl(appRoutes.permissionDeny));
  }
};
