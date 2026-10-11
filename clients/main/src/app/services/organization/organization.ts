import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import { appRoutes } from '../../data/app-routes';
import { UserType } from '../../types/enums/auth';
import {
  OrganizationCreateAdminRequest,
  OrganizationCreateOwnerRequest,
  OrganizationDto,
  OrganizationListQuery,
  OrganizationListResponse,
} from '../../types/interfaces/organization';

@Injectable({
  providedIn: 'root',
})
export class Organization {
  private http = inject(HttpClient);

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
