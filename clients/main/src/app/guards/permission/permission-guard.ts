import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { Profile } from '../../services/profile';
import { ActiveOrganizationResolver } from '../../services/organization/active-organization-resolver';
import { UserType } from '../../types/enums/auth';
import { appRoutes } from '../../data/app-routes';
import { AppNavigationState } from '../../types/interfaces/common';

export const permissionGuard: CanActivateFn = async (route, _state) => {
  const permission: UserType[] | null | undefined = route.data?.['requiredPermission'];
  const requireEmailVerified: boolean = route.data?.['requireEmailVerified'] !== false;
  const requireActiveOrganization: boolean = route.data?.['requireActiveOrganization'] !== false;
  const profileService = inject(Profile);
  const activeOrganizationResolver = inject(ActiveOrganizationResolver);
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
  } else if (requireEmailVerified && !userProfileData.isEmailVerified) {
    return new RedirectCommand(router.parseUrl(appRoutes.verifyEmail));
  }

  if (requireActiveOrganization) {
    // Owners and managers must have an active organization before reaching any role feature.
    // Right after signup, a failed lookup must not leave the user on the completed signup form.
    const navigationState = router.currentNavigation()?.extras.state as
      | AppNavigationState
      | undefined;
    const resolution = await activeOrganizationResolver.resolve({
      redirectOnFailure: navigationState?.afterSignup === true,
    });
    if (resolution.kind === 'redirect') {
      return new RedirectCommand(router.parseUrl(resolution.route));
    } else if (resolution.kind === 'blocked') {
      return false;
    }
  }

  if (permission.includes(userProfileData.role)) {
    // Check if the user's role matches any of the required permissions for the route.
    return true;
  } else {
    // If user's role does not match the required permissions, deny access.
    return new RedirectCommand(router.parseUrl(appRoutes.permissionDeny));
  }
};
