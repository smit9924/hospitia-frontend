import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmptyError, finalize, firstValueFrom, Observable, retry, throwError, timer } from 'rxjs';
import {
  ORGANIZATION_SELECTION_DESCRIPTION_ID,
  OrganizationSelectionDialog,
} from '../../components/organization/organization-selection-dialog/organization-selection-dialog';
import { appRoutes } from '../../data/app-routes';
import { environment } from '../../../environments/environment';
import { UserType } from '../../types/enums/auth';
import { ErrorCodes } from '../../types/enums/error-codes';
import { ApiErrorResponse } from '../../types/interfaces/common';
import {
  ActiveOrganizationResolution,
  OrganizationMembershipListResponse,
  OrganizationMembershipSummary,
  OrganizationSelectionDialogData,
} from '../../types/interfaces/organization';
import { Loader } from '../loader';
import { Profile } from '../profile';
import { Organization } from './organization';

const RESOLVED: ActiveOrganizationResolution = { kind: 'resolved' };
const BLOCKED: ActiveOrganizationResolution = { kind: 'blocked' };
const ACCOUNT_SETUP_FAILED: ActiveOrganizationResolution = {
  kind: 'redirect',
  route: appRoutes.accountSetupFailed,
};

/** Roles that always work within an active organization. */
const ORGANIZATION_SCOPED_ROLES: ReadonlySet<UserType> = new Set([
  UserType.OWNER,
  UserType.MANAGER,
]);

/**
 * The booking service doesn't know the user yet: right after signup, the
 * user-created event from the auth service may still be on its way.
 */
function isAccountSetupPending(error: unknown): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === HttpStatusCode.NotFound &&
    (error.error as ApiErrorResponse<unknown>)?.errorCode === ErrorCodes.USER_NOT_FOUND
  );
}

/**
 * Makes sure an owner/manager has an active organization before they reach
 * any role feature:
 * - a stored organization is re-validated with the backend once per app session;
 * - otherwise the user's memberships decide: none → onboarding route,
 *   one → selected automatically, several → blocking selection dialog;
 * - while a new account is still being set up in the booking service, the
 *   memberships request is retried behind the "Setting up your account" loader.
 */
@Injectable({
  providedIn: 'root',
})
export class ActiveOrganizationResolver {
  private readonly organizationService = inject(Organization);
  private readonly profileService = inject(Profile);
  private readonly dialog = inject(MatDialog);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly loaderService = inject(Loader);

  /** GUID of the active organization the backend confirmed during this app session. */
  private validatedOrganizationGuid: string | null = null;
  /** Shared by concurrent callers so memberships are fetched and the dialog opened once. */
  private pendingResolution: Promise<ActiveOrganizationResolution> | null = null;

  resolve(): Promise<ActiveOrganizationResolution> {
    const profile = this.profileService.userProfile();
    if (
      !profile?.isEmailVerified ||
      profile.role === null ||
      !ORGANIZATION_SCOPED_ROLES.has(profile.role)
    ) {
      return Promise.resolve(RESOLVED);
    }

    const activeOrganization = this.organizationService.activeOrganization();
    if (activeOrganization !== null && activeOrganization.guid === this.validatedOrganizationGuid) {
      return Promise.resolve(RESOLVED);
    }

    this.pendingResolution ??= this.resolveForRole(profile.role).finally(() => {
      this.pendingResolution = null;
    });
    return this.pendingResolution;
  }

  private async resolveForRole(role: UserType): Promise<ActiveOrganizationResolution> {
    this.organizationService.restoreActiveOrganization();

    if (this.organizationService.activeOrganization() !== null) {
      return this.validateActiveOrganization();
    }

    return this.resolveFromMemberships(role);
  }

  private async validateActiveOrganization(): Promise<ActiveOrganizationResolution> {
    try {
      const organization = await firstValueFrom(this.organizationService.getActiveOrganization());
      this.organizationService.refreshActiveOrganization(organization);
      this.validatedOrganizationGuid = organization.guid;
      return RESOLVED;
    } catch (error) {
      // EmptyError: the active-organization interceptor already handled the
      // rejection (logged the user out, or restarted resolution).
      if (!(error instanceof EmptyError)) {
        this.errorHandler.handleError(error);
      }
      return BLOCKED;
    }
  }

  private async resolveFromMemberships(role: UserType): Promise<ActiveOrganizationResolution> {
    let memberships: OrganizationMembershipSummary[];
    try {
      memberships = (await firstValueFrom(this.getMembershipsOnceAccountIsSetUp())).items;
    } catch (error) {
      if (isAccountSetupPending(error)) {
        // Still not set up after every retry.
        return ACCOUNT_SETUP_FAILED;
      }
      this.errorHandler.handleError(error);
      return BLOCKED;
    }

    if (memberships.length === 0) {
      return {
        kind: 'redirect',
        route:
          role === UserType.OWNER
            ? appRoutes.onboardingCreateOrganization
            : appRoutes.onboardingNoOrganization,
      };
    }

    const organization =
      memberships.length === 1 ? memberships[0] : await this.selectOrganization(memberships);
    if (organization === null) {
      // The user logged out from the selection dialog.
      return BLOCKED;
    }

    this.organizationService.setActiveOrganization(organization);
    this.validatedOrganizationGuid = organization.guid;
    return RESOLVED;
  }

  /**
   * Fetch the memberships, retrying at a fixed interval while the account is
   * still being set up. Any other error fails at once.
   */
  private getMembershipsOnceAccountIsSetUp(): Observable<OrganizationMembershipListResponse> {
    return this.organizationService.getMemberships().pipe(
      retry({
        count: environment.accountSetupMaxRetries,
        delay: (error: unknown) => {
          if (!isAccountSetupPending(error)) {
            return throwError(() => error);
          }
          this.loaderService.showAccountSetupLoader();
          return timer(environment.accountSetupRetryIntervalSeconds * 1000);
        },
      }),
      finalize(() => this.loaderService.hideAccountSetupLoader()),
    );
  }

  private async selectOrganization(
    organizations: OrganizationMembershipSummary[],
  ): Promise<OrganizationMembershipSummary | null> {
    const dialogRef = this.dialog.open<
      OrganizationSelectionDialog,
      OrganizationSelectionDialogData,
      OrganizationMembershipSummary | null
    >(OrganizationSelectionDialog, {
      data: { organizations },
      disableClose: true,
      width: '480px',
      ariaDescribedBy: ORGANIZATION_SELECTION_DESCRIPTION_ID,
      panelClass: 'full-screen-dialog-mobile',
    });

    return (await firstValueFrom(dialogRef.afterClosed())) ?? null;
  }
}
