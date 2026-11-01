import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  RoomCreateRequest,
  RoomListItem,
  RoomListQuery,
  RoomListResponse,
  RoomUpdateRequest,
} from '../../types/interfaces/room';

/**
 * Calls the booking service's room APIs.
 *
 * Owners and managers are scoped by the backend to their active
 * organization (sent by the active-organization interceptor); admins see
 * every organization.
 */
@Injectable({
  providedIn: 'root',
})
export class Room {
  private readonly http = inject(HttpClient);

  getRoom(guid: string): Observable<RoomListItem> {
    return this.http.get<RoomListItem>(apiRoutes.room.get, { params: { guid } });
  }

  list(query: RoomListQuery): Observable<RoomListResponse> {
    return this.http.get<RoomListResponse>(apiRoutes.room.list, {
      params: {
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        searchTerm: query.searchTerm ?? '',
      },
    });
  }

  create(payload: RoomCreateRequest): Observable<RoomListItem> {
    return this.http.post<RoomListItem>(apiRoutes.room.create, payload);
  }

  /** Updates the room identified by `payload.guid`. */
  update(payload: RoomUpdateRequest): Observable<RoomListItem> {
    return this.http.put<RoomListItem>(apiRoutes.room.update, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.room.delete, { params: { guid } });
  }
}
