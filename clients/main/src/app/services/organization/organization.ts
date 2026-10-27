import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import { appRoutes } from '../../data/app-routes';
import { localStorageKeys } from '../../data/localstorage-keys';
import { UserType } from '../../types/enums/auth';
import {
  OrganizationCreateAdminRequest,
  OrganizationCreateOwnerRequest,
  OrganizationDto,
  OrganizationListQuery,
  OrganizationListResponse,
  OrganizationMembershipListResponse,
  OrganizationMembershipSummary,
  StoredActiveOrganization,
} from '../../types/interfaces/organization';
import { Auth } from '../auth';
import { Localstorage } from '../localstorage';
import { Profile } from '../profile';

@Injectable({
  providedIn: 'root',
})
export class Organization {
  private http = inject(HttpClient);
  private localstorageService = inject(Localstorage);
  private profileService = inject(Profile);
  private authService = inject(Auth);

  /**
   * Organization the current owner/manager works in for this login session.
   * Set once and cleared only on logout; to switch, the user logs out and in again.
   */
  private _activeOrganization = signal<OrganizationMembershipSummary | null>(null);
  activeOrganization = this._activeOrganization.asReadonly();

  constructor() {
    // Reset the in-memory active organization when the user logs out.
    // The persisted copy is removed by `Auth.logout()`.
    effect(() => {
      if (this.authService.isLoggedOut) {
        this._activeOrganization.set(null);
      }
    });
  }

  listAdmin(query: OrganizationListQuery): Observable<OrganizationListResponse> {
    return this.list(apiRoutes.organization.listAdmin, query);
  }

  listOwner(query: OrganizationListQuery): Observable<OrganizationListResponse> {
    return this.list(apiRoutes.organization.listOwner, query);
  }

  listManager(query: OrganizationListQuery): Observable<OrganizationListResponse> {
    return this.list(apiRoutes.organization.listManager, query);
  }

  getOrganization(guid: string): Observable<OrganizationDto> {
    return this.http.get<OrganizationDto>(apiRoutes.organization.get(guid));
  }

  createAsAdmin(payload: OrganizationCreateAdminRequest): Observable<OrganizationDto> {
    if (payload.guid) {
      return this.http.put<OrganizationDto>(apiRoutes.organization.createAdmin, payload);
    }
    return this.http.post<OrganizationDto>(apiRoutes.organization.createAdmin, payload);
  }

  createAsOwner(payload: OrganizationCreateOwnerRequest): Observable<OrganizationDto> {
    if (payload.guid) {
      return this.http.put<OrganizationDto>(apiRoutes.organization.createOwner, payload);
    }
    return this.http.post<OrganizationDto>(apiRoutes.organization.createOwner, payload);
  }

  deleteOrganization(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.organization.delete(guid));
  }

  /** Every active organization the current user is actively mapped to. */
  getMemberships(): Observable<OrganizationMembershipListResponse> {
    return this.http.get<OrganizationMembershipListResponse>(apiRoutes.organization.memberships);
  }

  /** Validate the active organization (sent as a header) and fetch its latest details. */
  getActiveOrganization(): Observable<OrganizationMembershipSummary> {
    return this.http.get<OrganizationMembershipSummary>(apiRoutes.organization.active);
  }

  /**
   * Load the persisted active organization into memory, e.g. after a page reload.
   * A value stored for a different user is discarded.
   */
  restoreActiveOrganization(): void {
    if (this._activeOrganization() !== null) {
      return;
    }

    const stored = this.localstorageService.getItem<StoredActiveOrganization>(
      localStorageKeys.activeOrganization,
    );
    if (stored === null) {
      return;
    }

    if (stored.userGuid === this.profileService.userProfile()?.guid) {
      this._activeOrganization.set(stored.organization);
    } else {
      this.localstorageService.removeItem(localStorageKeys.activeOrganization);
    }
  }

  /**
   * Set the active organization for this session. Ignored when one is already
   * active: the selection can't change until the user logs out.
   */
  setActiveOrganization(organization: OrganizationMembershipSummary): void {
    if (this._activeOrganization() !== null) {
      return;
    }

    this.persistActiveOrganization(organization);
  }

  /** Refresh the details of the current active organization, e.g. after a rename. */
  refreshActiveOrganization(organization: OrganizationMembershipSummary): void {
    if (this._activeOrganization()?.guid !== organization.guid) {
      return;
    }

    this.persistActiveOrganization(organization);
  }

  /** Drop the active organization when the backend no longer accepts it. */
  clearActiveOrganization(): void {
    this.localstorageService.removeItem(localStorageKeys.activeOrganization);
    this._activeOrganization.set(null);
  }

  /**
   * Resolve the default organization listing route for the given role.
   * Centralized so components never re-derive this mapping themselves.
   */
  getDefaultOrganizationListingRouteForUser(role: UserType | undefined): string {
    switch (role) {
      case UserType.ADMIN: {
        return appRoutes.organizationListingAdmin;
      }
      case UserType.OWNER: {
        return appRoutes.organizationListingOwner;
      }
      case UserType.MANAGER: {
        return appRoutes.organizationListingManager;
      }
      default: {
        return appRoutes.notFound;
      }
    }
  }

  private persistActiveOrganization(organization: OrganizationMembershipSummary): void {
    const userGuid = this.profileService.userProfile()?.guid;
    if (!userGuid) {
      return;
    }

    const stored: StoredActiveOrganization = { userGuid, organization };
    this.localstorageService.setItem(localStorageKeys.activeOrganization, stored);
    this._activeOrganization.set(organization);
  }

  private list(url: string, query: OrganizationListQuery): Observable<OrganizationListResponse> {
    return this.http.get<OrganizationListResponse>(url, {
      params: {
        pageSize: query.pageSize ?? 10,
        sortBy: query.sortBy ?? 'name',
        sortDirection: query.sortDirection ?? 'asc',
        pageNumber: query.pageNumber ?? 1,
        searchTerm: query.searchTerm ?? '',
      },
    });
  }
}
