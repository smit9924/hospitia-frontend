import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  CurrencyUnitListItem,
  CurrencyUnitListQuery,
  CurrencyUnitListResponse,
  CurrencyUnitOption,
  CurrencyUnitCreateRequest,
  CurrencyUnitUpdateRequest,
} from '../../types/interfaces/currency-unit';

/** Calls the booking service's currency unit APIs. */
@Injectable({
  providedIn: 'root',
})
export class CurrencyUnit {
  private readonly http = inject(HttpClient);

  getCurrencyUnit(guid: string): Observable<CurrencyUnitListItem> {
    return this.http.get<CurrencyUnitListItem>(apiRoutes.currencyUnit.get, { params: { guid } });
  }

  list(query: CurrencyUnitListQuery): Observable<CurrencyUnitListResponse> {
    return this.http.get<CurrencyUnitListResponse>(apiRoutes.currencyUnit.list, {
      params: {
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        pageNumber: query.pageNumber,
        searchTerm: query.searchTerm ?? '',
      },
    });
  }

  /** Every active currency unit, ordered by code, for currency drop-downs. */
  listOptions(): Observable<CurrencyUnitOption[]> {
    return this.http.get<CurrencyUnitOption[]>(apiRoutes.currencyUnit.options);
  }

  create(payload: CurrencyUnitCreateRequest): Observable<CurrencyUnitListItem> {
    return this.http.post<CurrencyUnitListItem>(apiRoutes.currencyUnit.create, payload);
  }

  /** Updates the currency unit identified by `payload.guid`. */
  update(payload: CurrencyUnitUpdateRequest): Observable<CurrencyUnitListItem> {
    return this.http.put<CurrencyUnitListItem>(apiRoutes.currencyUnit.update, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.currencyUnit.delete, { params: { guid } });
  }
}
