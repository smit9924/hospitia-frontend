import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  RedirectCommand,
  RouterStateSnapshot,
} from '@angular/router';

import { organizationOnboardingGuard } from './organization-onboarding-guard';
import { appRoutes } from '../../data/app-routes';
import { Organization } from '../../services/organization/organization';
import { Profile } from '../../services/profile';
import { UserType } from '../../types/enums/auth';
import { OrganizationMembershipSummary } from '../../types/interfaces/organization';
import { UserProfileModel } from '../../types/models/users/user-profile-model';

describe('organizationOnboardingGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => organizationOnboardingGuard(...guardParameters));

  const userProfile = signal<UserProfileModel | null>(null);
  const activeOrganization = signal<OrganizationMembershipSummary | null>(null);
  const ownerOnboardingRoute = {
    data: { onboardingFor: UserType.OWNER },
  } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const signInAs = (role: UserType) =>
    userProfile.set(new UserProfileModel({ guid: 'user-a', role, isEmailVerified: true }));

  beforeEach(() => {
    activeOrganization.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: Profile,
          useValue: {
            userProfile,
            getDefaultHomeRouteForUser: () => Promise.resolve(appRoutes.ownerDashboard),
          },
        },
        {
          provide: Organization,
          useValue: { activeOrganization, restoreActiveOrganization: vi.fn() },
        },
      ],
    });
  });

  it('allows the intended role while it has no active organization', async () => {
    signInAs(UserType.OWNER);

    expect(await executeGuard(ownerOnboardingRoute, state)).toBe(true);
  });

  it('sends a user who already has an active organization home', async () => {
    signInAs(UserType.OWNER);
    activeOrganization.set({
      guid: 'org',
      name: 'Sunrise NGO',
      organizationTypeName: 'x',
      city: null,
    });

    const result = await executeGuard(ownerOnboardingRoute, state);

    expect((result as RedirectCommand).redirectTo.toString()).toBe(appRoutes.ownerDashboard);
  });

  it('sends other roles home', async () => {
    signInAs(UserType.MANAGER);

    const result = await executeGuard(ownerOnboardingRoute, state);

    expect(result).toBeInstanceOf(RedirectCommand);
  });
});
