import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { defer, EMPTY, of, Subject, throwError } from 'rxjs';
import { OrganizationSelectionDialog } from '../../components/organization/organization-selection-dialog/organization-selection-dialog';
import { appRoutes } from '../../data/app-routes';
import { environment } from '../../../environments/environment';
import { UserType } from '../../types/enums/auth';
import { ErrorCodes } from '../../types/enums/error-codes';
import { OrganizationMembershipSummary } from '../../types/interfaces/organization';
import { UserProfileModel } from '../../types/models/users/user-profile-model';
import { Loader } from '../loader';
import { Profile } from '../profile';
import { ActiveOrganizationResolver } from './active-organization-resolver';
import { Organization } from './organization';

const sunrise: OrganizationMembershipSummary = {
  guid: 'org-sunrise',
  name: 'Sunrise NGO',
  organizationTypeName: 'Guest house',
  city: 'Pune',
};
const hope: OrganizationMembershipSummary = {
  guid: 'org-hope',
  name: 'Hope Foundation',
  organizationTypeName: 'Hostel',
  city: 'Mumbai',
};

describe('ActiveOrganizationResolver', () => {
  let resolver: ActiveOrganizationResolver;
  const userProfile = signal<UserProfileModel | null>(null);
  const activeOrganization = signal<OrganizationMembershipSummary | null>(null);
  let storedOrganization: OrganizationMembershipSummary | null;
  let dialogResult: Subject<OrganizationMembershipSummary | null>;

  const organizationService = {
    activeOrganization: activeOrganization.asReadonly(),
    restoreActiveOrganization: vi.fn(() => {
      if (activeOrganization() === null && storedOrganization !== null) {
        activeOrganization.set(storedOrganization);
      }
    }),
    setActiveOrganization: vi.fn((organization: OrganizationMembershipSummary) =>
      activeOrganization.set(organization),
    ),
    refreshActiveOrganization: vi.fn(),
    getMemberships: vi.fn(),
    getActiveOrganization: vi.fn(),
  };
  const dialog = { open: vi.fn() };
  const errorHandler = { handleError: vi.fn() };

  const signInAs = (role: UserType, isEmailVerified = true) =>
    userProfile.set(new UserProfileModel({ guid: 'user-a', role, isEmailVerified }));
  const memberships = (...items: OrganizationMembershipSummary[]) =>
    organizationService.getMemberships.mockReturnValue(of({ items }));

  beforeEach(() => {
    vi.clearAllMocks();
    activeOrganization.set(null);
    storedOrganization = null;
    dialogResult = new Subject();
    dialog.open.mockReturnValue({ afterClosed: () => dialogResult });

    TestBed.configureTestingModule({
      providers: [
        { provide: Organization, useValue: organizationService },
        { provide: Profile, useValue: { userProfile } },
        { provide: MatDialog, useValue: dialog },
        { provide: ErrorHandler, useValue: errorHandler },
      ],
    });
    resolver = TestBed.inject(ActiveOrganizationResolver);
  });

  it.each([UserType.ADMIN, UserType.CUSTOMER])(
    'skips roles without organizations (role %s)',
    async (role) => {
      signInAs(role);

      expect(await resolver.resolve()).toEqual({ kind: 'resolved' });
      expect(organizationService.getMemberships).not.toHaveBeenCalled();
    },
  );

  it('skips users whose email is not verified yet', async () => {
    signInAs(UserType.OWNER, false);

    expect(await resolver.resolve()).toEqual({ kind: 'resolved' });
    expect(organizationService.getMemberships).not.toHaveBeenCalled();
  });

  it('sends an owner without organizations to onboarding', async () => {
    signInAs(UserType.OWNER);
    memberships();

    expect(await resolver.resolve()).toEqual({
      kind: 'redirect',
      route: appRoutes.onboardingCreateOrganization,
    });
  });

  it('sends a manager without organizations to the no-organization page', async () => {
    signInAs(UserType.MANAGER);
    memberships();

    expect(await resolver.resolve()).toEqual({
      kind: 'redirect',
      route: appRoutes.onboardingNoOrganization,
    });
  });

  it('activates a single organization without asking', async () => {
    signInAs(UserType.MANAGER);
    memberships(sunrise);

    expect(await resolver.resolve()).toEqual({ kind: 'resolved' });
    expect(organizationService.setActiveOrganization).toHaveBeenCalledWith(sunrise);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('asks a user with several organizations to pick one in a blocking dialog', async () => {
    signInAs(UserType.OWNER);
    memberships(sunrise, hope);

    const resolution = resolver.resolve();
    await vi.waitFor(() => expect(dialog.open).toHaveBeenCalled());
    dialogResult.next(hope);
    dialogResult.complete();

    expect(await resolution).toEqual({ kind: 'resolved' });
    expect(dialog.open).toHaveBeenCalledWith(
      OrganizationSelectionDialog,
      expect.objectContaining({ disableClose: true, data: { organizations: [sunrise, hope] } }),
    );
    expect(organizationService.setActiveOrganization).toHaveBeenCalledWith(hope);
  });

  it('stays blocked when the user logs out from the selection dialog', async () => {
    signInAs(UserType.OWNER);
    memberships(sunrise, hope);

    const resolution = resolver.resolve();
    await vi.waitFor(() => expect(dialog.open).toHaveBeenCalled());
    dialogResult.next(null);
    dialogResult.complete();

    expect(await resolution).toEqual({ kind: 'blocked' });
    expect(organizationService.setActiveOrganization).not.toHaveBeenCalled();
  });

  it('does not ask again once an organization is resolved', async () => {
    signInAs(UserType.MANAGER);
    memberships(sunrise);
    await resolver.resolve();

    expect(await resolver.resolve()).toEqual({ kind: 'resolved' });
    expect(organizationService.getMemberships).toHaveBeenCalledTimes(1);
    expect(organizationService.getActiveOrganization).not.toHaveBeenCalled();
  });

  it('shares one lookup between concurrent callers', async () => {
    signInAs(UserType.MANAGER);
    memberships(sunrise);

    const [first, second] = await Promise.all([resolver.resolve(), resolver.resolve()]);

    expect(first).toEqual({ kind: 'resolved' });
    expect(second).toEqual({ kind: 'resolved' });
    expect(organizationService.getMemberships).toHaveBeenCalledTimes(1);
  });

  it('re-validates a stored organization once per app session', async () => {
    signInAs(UserType.OWNER);
    storedOrganization = sunrise;
    organizationService.getActiveOrganization.mockReturnValue(
      of({ ...sunrise, name: 'Sunrise Trust' }),
    );

    expect(await resolver.resolve()).toEqual({ kind: 'resolved' });
    expect(await resolver.resolve()).toEqual({ kind: 'resolved' });

    expect(organizationService.getActiveOrganization).toHaveBeenCalledTimes(1);
    expect(organizationService.refreshActiveOrganization).toHaveBeenCalledWith({
      ...sunrise,
      name: 'Sunrise Trust',
    });
    expect(organizationService.getMemberships).not.toHaveBeenCalled();
  });

  it('stays blocked when the interceptor rejected the stored organization', async () => {
    signInAs(UserType.OWNER);
    storedOrganization = sunrise;
    organizationService.getActiveOrganization.mockReturnValue(EMPTY);

    expect(await resolver.resolve()).toEqual({ kind: 'blocked' });
    expect(errorHandler.handleError).not.toHaveBeenCalled();
  });

  it('reports a failed membership lookup and stays blocked', async () => {
    signInAs(UserType.OWNER);
    const error = new HttpErrorResponse({ status: 500 });
    organizationService.getMemberships.mockReturnValue(throwError(() => error));

    expect(await resolver.resolve()).toEqual({ kind: 'blocked' });
    expect(errorHandler.handleError).toHaveBeenCalledWith(error);
  });

  describe('while a new account is still being set up', () => {
    const retryIntervalMs = environment.accountSetupRetryIntervalSeconds * 1000;
    const userNotFound = new HttpErrorResponse({
      status: HttpStatusCode.NotFound,
      error: { errorCode: ErrorCodes.USER_NOT_FOUND, message: 'The requested user was not found.' },
    });
    let loader: Loader;
    let requests: number;

    /** The booking service answers "user not found" for the first `failures` requests. */
    const userKnownAfter = (failures: number) => {
      requests = 0;
      organizationService.getMemberships.mockReturnValue(
        defer(() => (++requests <= failures ? throwError(() => userNotFound) : of({ items: [] }))),
      );
    };

    beforeEach(() => {
      vi.useFakeTimers();
      loader = TestBed.inject(Loader);
      vi.spyOn(loader, 'showAccountSetupLoader');
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('retries every interval behind the account setup loader, then continues', async () => {
      signInAs(UserType.OWNER);
      userKnownAfter(2);

      const resolution = resolver.resolve();
      await vi.advanceTimersByTimeAsync(retryIntervalMs - 1);
      expect(requests).toBe(1);
      expect(loader.accountSetupLoading()).toBe(true);
      await vi.advanceTimersByTimeAsync(retryIntervalMs + 1);

      expect(await resolution).toEqual({
        kind: 'redirect',
        route: appRoutes.onboardingCreateOrganization,
      });
      expect(requests).toBe(3);
      expect(loader.showAccountSetupLoader).toHaveBeenCalledTimes(2);
      expect(loader.accountSetupLoading()).toBe(false);
      expect(errorHandler.handleError).not.toHaveBeenCalled();
    });

    it('shows the account setup error page once every retry is used up', async () => {
      signInAs(UserType.OWNER);
      userKnownAfter(Number.POSITIVE_INFINITY);

      const resolution = resolver.resolve();
      await vi.advanceTimersByTimeAsync(environment.accountSetupMaxRetries * retryIntervalMs);

      expect(await resolution).toEqual({
        kind: 'redirect',
        route: appRoutes.accountSetupFailed,
      });
      // The first request plus every retry.
      expect(requests).toBe(environment.accountSetupMaxRetries + 1);
      expect(loader.accountSetupLoading()).toBe(false);
      expect(errorHandler.handleError).not.toHaveBeenCalled();
    });

    it('does not retry a "not found" for anything other than the user', async () => {
      signInAs(UserType.OWNER);
      const error = new HttpErrorResponse({
        status: HttpStatusCode.NotFound,
        error: { errorCode: ErrorCodes.ORGANIZATION_NOT_FOUND },
      });
      organizationService.getMemberships.mockReturnValue(throwError(() => error));

      expect(await resolver.resolve()).toEqual({ kind: 'blocked' });
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
      expect(loader.showAccountSetupLoader).not.toHaveBeenCalled();
      expect(loader.accountSetupLoading()).toBe(false);
    });
  });
});
