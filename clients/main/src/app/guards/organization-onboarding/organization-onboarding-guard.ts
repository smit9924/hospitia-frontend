import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { Organization } from '../../services/organization/organization';
import { Profile } from '../../services/profile';
import { UserType } from '../../types/enums/auth';

/**
 * Keeps organization onboarding pages for the role they are meant for
 * (`route.data.onboardingFor`) while that user has no active organization.
 * Everyone else is sent to their default home. Run after `permissionGuard`.
 */
export const organizationOnboardingGuard: CanActivateFn = async (route, _state) => {
  const onboardingFor: UserType | undefined = route.data?.['onboardingFor'];
  const profileService = inject(Profile);
  const organizationService = inject(Organization);
  const router = inject(Router);

  organizationService.restoreActiveOrganization();

  if (
    profileService.userProfile()?.role === onboardingFor &&
    organizationService.activeOrganization() === null
  ) {
    return true;
  }

  const defaultHomeRoute = await profileService.getDefaultHomeRouteForUser();
  return new RedirectCommand(router.parseUrl(defaultHomeRoute));
};
