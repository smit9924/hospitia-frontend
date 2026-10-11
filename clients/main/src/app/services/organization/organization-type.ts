import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  OrganizationTypeListItem,
  OrganizationTypeListQuery,
  OrganizationTypeListResponse,
  OrganizationTypeUpsertRequest,
} from '../../types/interfaces/organization-type';

@Injectable({
  providedIn: 'root',
})
export class OrganizationType {
  private http = inject(HttpClient);

  getOrganizationType(guid: string): Observable<OrganizationTypeListItem> {
    return this.http.get<OrganizationTypeListItem>(apiRoutes.organizationType.get(guid));
  }

  list(query: OrganizationTypeListQuery): Observable<OrganizationTypeListResponse> {
    return this.http.get<OrganizationTypeListResponse>(apiRoutes.organizationType.list, {
      params: {
        pageSize: query.pageSize ?? 10,
        sortBy: query.sortBy ?? 'name',
        sortDirection: query.sortDirection ?? 'asc',
        pageNumber: query.pageNumber ?? 1,
        searchTerm: query.searchTerm ?? '',
      },
    });
  }

  upsert(payload: OrganizationTypeUpsertRequest): Observable<OrganizationTypeListItem> {
    if (payload.guid) {
      return this.http.put<OrganizationTypeListItem>(apiRoutes.organizationType.upsert, payload);
    }
    return this.http.post<OrganizationTypeListItem>(apiRoutes.organizationType.upsert, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.organizationType.delete(guid));
  }
}
