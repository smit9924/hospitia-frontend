import { PaginatedQuery, PaginatedResponse } from './pagination';

export type CurrencyUnitSortBy =
  | 'currencyCode'
  | 'numericCode'
  | 'currencyName'
  | 'createdAt'
  | 'updatedAt';

/** A currency unit as returned by the currency unit management APIs. */
export interface CurrencyUnitListItem {
  guid: string;
  /** ISO 4217 alphabetic code, e.g. "INR". */
  currencyCode: string;
  /** ISO 4217 numeric code with leading zeros, e.g. "036". */
  numericCode: string;
  currencyName: string;
  /** Decimal places of the currency; null when ISO 4217 defines none. */
  minorUnit: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Compact currency unit used to fill currency drop-downs. */
export interface CurrencyUnitOption {
  guid: string;
  currencyCode: string;
  currencyName: string;
  minorUnit: number | null;
}

export interface CurrencyUnitUpsertRequest {
  guid?: string | null;
  currencyCode: string;
  numericCode: string;
  currencyName: string;
  minorUnit: number | null;
}

export type CurrencyUnitListQuery = PaginatedQuery<CurrencyUnitSortBy>;

export type CurrencyUnitListResponse = PaginatedResponse<CurrencyUnitListItem>;
