import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  RoomTypeListItem,
  RoomTypeListQuery,
  RoomTypeListResponse,
  RoomTypeCreateRequest,
  RoomTypeOption,
  RoomTypeUpdateRequest,
} from '../../types/interfaces/room-type';

/**
 * Calls the booking service's room type APIs.
 *
 * Owners and managers are scoped by the backend to their active
 * organization (sent by the active-organization interceptor); admins see
 * every organization.
 */
@Injectable({
  providedIn: 'root',
})
export class RoomType {
  private readonly http = inject(HttpClient);

  getRoomType(guid: string): Observable<RoomTypeListItem> {
    return this.http.get<RoomTypeListItem>(apiRoutes.roomType.get, { params: { guid } });
  }

  list(query: RoomTypeListQuery): Observable<RoomTypeListResponse> {
    return this.http.get<RoomTypeListResponse>(apiRoutes.roomType.list, {
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
   * Room types a room of the organization may use. Admins pass the chosen
   * organization (an empty list comes back without one); owners and
   * managers get their active organization's room types.
   */
  listOptions(organizationGuid: string | null): Observable<RoomTypeOption[]> {
    return this.http.get<RoomTypeOption[]>(apiRoutes.roomType.options, {
      params: organizationGuid ? { organizationGuid } : {},
    });
  }

  create(payload: RoomTypeCreateRequest): Observable<RoomTypeListItem> {
    return this.http.post<RoomTypeListItem>(apiRoutes.roomType.create, payload);
  }

  /** Updates the room type identified by `payload.guid`. */
  update(payload: RoomTypeUpdateRequest): Observable<RoomTypeListItem> {
    return this.http.put<RoomTypeListItem>(apiRoutes.roomType.update, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.roomType.delete, { params: { guid } });
  }
}
