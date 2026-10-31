import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  RoomTypeListItem,
  RoomTypeListQuery,
  RoomTypeListResponse,
  RoomTypeUpsertRequest,
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
    return this.http.get<RoomTypeListItem>(apiRoutes.roomType.get(guid));
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

  upsert(payload: RoomTypeUpsertRequest): Observable<RoomTypeListItem> {
    if (payload.guid) {
      return this.http.put<RoomTypeListItem>(apiRoutes.roomType.upsert, payload);
    }
    return this.http.post<RoomTypeListItem>(apiRoutes.roomType.upsert, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.roomType.delete(guid));
  }
}
