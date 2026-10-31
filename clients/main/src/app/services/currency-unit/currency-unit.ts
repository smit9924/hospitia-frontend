import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../../data/api-routes';
import {
  CurrencyUnitListItem,
  CurrencyUnitListQuery,
  CurrencyUnitListResponse,
  CurrencyUnitOption,
  CurrencyUnitUpsertRequest,
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

  upsert(payload: CurrencyUnitUpsertRequest): Observable<CurrencyUnitListItem> {
    if (payload.guid) {
      return this.http.put<CurrencyUnitListItem>(apiRoutes.currencyUnit.upsert, payload);
    }
    return this.http.post<CurrencyUnitListItem>(apiRoutes.currencyUnit.upsert, payload);
  }

  delete(guid: string): Observable<void> {
    return this.http.delete<void>(apiRoutes.currencyUnit.delete, { params: { guid } });
  }
}
