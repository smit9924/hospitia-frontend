import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  RoomAmenityListItem,
  RoomAmenityListQuery,
  RoomAmenityListResponse,
  RoomAmenityOption,
  RoomAmenityUpsertRequest,
} from '../../types/interfaces/room-amenity';

/**
 * Calls the booking service's room amenity APIs.
 *
 * Owners and managers are scoped by the backend to their active
 * organization (sent by the active-organization interceptor); admins see
 * every organization.
 */
@Injectable({
  providedIn: 'root',
})
export class RoomAmenity {
  private readonly http = inject(HttpClient);

  getRoomAmenity(guid: string): Observable<RoomAmenityListItem> {
    return this.http.get<RoomAmenityListItem>(apiRoutes.roomAmenity.get(guid));
  }

  list(query: RoomAmenityListQuery): Observable<RoomAmenityListResponse> {
    return this.http.get<RoomAmenityListResponse>(apiRoutes.roomAmenity.list, {
      params: {
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        searchTerm: query.searchTerm ?? '',
      },
    });
  }

  /**
   * Amenities a room type may use: the defaults plus the organization's
   * custom amenities, ordered by name. Admins pass the organization;
   * owners and managers get their active organization.
   */
  listSelectable(organizationGuid?: string | null): Observable<RoomAmenityOption[]> {
    let params = new HttpParams();
    if (organizationGuid) {
      params = params.set('organizationGuid', organizationGuid);
    }
    return this.http.get<RoomAmenityOption[]>(apiRoutes.roomAmenity.selectable, { params });
  }

  upsert(payload: RoomAmenityUpsertRequest): Observable<RoomAmenityListItem> {
    if (payload.guid) {
      return this.http.put<RoomAmenityListItem>(apiRoutes.roomAmenity.upsert, payload);
    }
    return this.http.post<RoomAmenityListItem>(apiRoutes.roomAmenity.upsert, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.roomAmenity.delete(guid));
  }
}
