import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Navigation,
  provideRouter,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { permissionGuard } from './permission-guard';
import { appRoutes } from '../../data/app-routes';
import { ActiveOrganizationResolver } from '../../services/organization/active-organization-resolver';
import { Profile } from '../../services/profile';
import { UserType } from '../../types/enums/auth';
import {
  ActiveOrganizationResolution,
  ActiveOrganizationResolveOptions,
} from '../../types/interfaces/organization';
import { UserProfileModel } from '../../types/models/users/user-profile-model';

describe('permissionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => permissionGuard(...guardParameters));

  const userProfile = signal<UserProfileModel | null>(null);
  const resolver = {
    resolve:
      vi.fn<
        (options?: ActiveOrganizationResolveOptions) => Promise<ActiveOrganizationResolution>
      >(),
  };

  const routeWith = (data: Record<string, unknown>) =>
    ({ data }) as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const ownerRoute = routeWith({ requiredPermission: [UserType.OWNER] });

  beforeEach(() => {
    vi.clearAllMocks();
    userProfile.set(
      new UserProfileModel({ guid: 'user-a', role: UserType.OWNER, isEmailVerified: true }),
    );

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Profile, useValue: { userProfile } },
        { provide: ActiveOrganizationResolver, useValue: resolver },
      ],
    });
  });

  it('allows the route once the active organization is resolved', async () => {
    resolver.resolve.mockResolvedValue({ kind: 'resolved' });

    expect(await executeGuard(ownerRoute, state)).toBe(true);
  });

  it('redirects to the route chosen by organization resolution', async () => {
    resolver.resolve.mockResolvedValue({
      kind: 'redirect',
      route: appRoutes.onboardingCreateOrganization,
    });

    const result = await executeGuard(ownerRoute, state);

    expect(result).toBeInstanceOf(RedirectCommand);
    expect((result as RedirectCommand).redirectTo.toString()).toBe(
      appRoutes.onboardingCreateOrganization,
    );
  });

  it('keeps the default failure handling for an ordinary navigation', async () => {
    resolver.resolve.mockResolvedValue({ kind: 'resolved' });

    await executeGuard(ownerRoute, state);

    expect(resolver.resolve).toHaveBeenCalledWith({ redirectOnFailure: false });
  });

  it('asks for a redirect on failure when the navigation comes from signup', async () => {
    resolver.resolve.mockResolvedValue({ kind: 'resolved' });
    vi.spyOn(TestBed.inject(Router), 'currentNavigation').mockReturnValue({
      extras: { state: { afterSignup: true } },
    } as unknown as Navigation);

    await executeGuard(ownerRoute, state);

    expect(resolver.resolve).toHaveBeenCalledWith({ redirectOnFailure: true });
  });

  it('cancels navigation while organization resolution is blocked', async () => {
    resolver.resolve.mockResolvedValue({ kind: 'blocked' });

    expect(await executeGuard(ownerRoute, state)).toBe(false);
  });

  it('skips organization resolution on routes that opt out', async () => {
    const route = routeWith({
      requiredPermission: [UserType.OWNER],
      requireActiveOrganization: false,
    });

    expect(await executeGuard(route, state)).toBe(true);
    expect(resolver.resolve).not.toHaveBeenCalled();
  });

  it('checks email verification before the active organization', async () => {
    userProfile.set(
      new UserProfileModel({ guid: 'user-a', role: UserType.OWNER, isEmailVerified: false }),
    );

    const result = await executeGuard(ownerRoute, state);

    expect((result as RedirectCommand).redirectTo.toString()).toBe(appRoutes.verifyEmail);
    expect(resolver.resolve).not.toHaveBeenCalled();
  });
});
