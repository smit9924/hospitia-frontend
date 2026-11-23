import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  AvailableRoom,
  AvailableRoomsQuery,
  BookingCancelRequest,
  BookingCreateRequest,
  BookingDetail,
  BookingListQuery,
  BookingListResponse,
  BookingTodaySummary,
  BookingUpdateRequest,
} from '../../types/interfaces/booking';

/** HTTP client for the booking service's booking endpoints. */
@Injectable({
  providedIn: 'root',
})
export class Booking {
  private readonly http = inject(HttpClient);

  getBooking(guid: string): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(apiRoutes.booking.get, { params: { guid } });
  }

  list(query: BookingListQuery): Observable<BookingListResponse> {
    let params = new HttpParams()
      .set('searchTerm', query.searchTerm)
      .set('pageSize', query.pageSize)
      .set('pageNumber', query.pageNumber)
      .set('sortBy', query.sortBy)
      .set('sortDirection', query.sortDirection);
    for (const status of query.statuses) {
      params = params.append('statuses', status);
    }
    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }
    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }
    return this.http.get<BookingListResponse>(apiRoutes.booking.list, { params });
  }

  listAvailableRooms(query: AvailableRoomsQuery): Observable<AvailableRoom[]> {
    let params = new HttpParams()
      .set('checkInDate', query.checkInDate)
      .set('checkOutDate', query.checkOutDate);
    if (query.organizationGuid) {
      params = params.set('organizationGuid', query.organizationGuid);
    }
    if (query.excludeBookingGuid) {
      params = params.set('excludeBookingGuid', query.excludeBookingGuid);
    }
    return this.http.get<AvailableRoom[]>(apiRoutes.booking.availableRooms, { params });
  }

  create(payload: BookingCreateRequest): Observable<BookingDetail> {
    return this.http.post<BookingDetail>(apiRoutes.booking.create, payload);
  }

  update(payload: BookingUpdateRequest): Observable<BookingDetail> {
    return this.http.put<BookingDetail>(apiRoutes.booking.update, payload);
  }

  checkIn(guid: string): Observable<BookingDetail> {
    return this.http.post<BookingDetail>(apiRoutes.booking.checkIn, { guid });
  }

  checkOut(guid: string): Observable<BookingDetail> {
    return this.http.post<BookingDetail>(apiRoutes.booking.checkOut, { guid });
  }

  cancel(payload: BookingCancelRequest): Observable<BookingDetail> {
    return this.http.post<BookingDetail>(apiRoutes.booking.cancel, payload);
  }

  /** Arrivals, departures and in-house counts of the active organization on `onDate` (local date). */
  getTodaySummary(onDate: string): Observable<BookingTodaySummary> {
    return this.http.get<BookingTodaySummary>(apiRoutes.booking.todaySummary, {
      params: { onDate },
    });
  }
}
