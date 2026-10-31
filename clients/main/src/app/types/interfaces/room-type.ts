import { CurrencyUnitOption } from './currency-unit';
import { PaginatedQuery, PaginatedResponse } from './pagination';
import { OrganizationReference, RoomAmenityOption } from './room-amenity';

export type RoomTypeSortBy = 'name' | 'capacity' | 'costPerNight' | 'createdAt' | 'updatedAt';

/** A room type (a category of rooms, not an individual room) of one organization. */
export interface RoomTypeListItem {
  guid: string;
  name: string;
  description: string | null;
  /** Maximum number of guests. */
  capacity: number;
  /** Decimal string with two places, e.g. "1500.00", to keep money exact. */
  costPerNight: string;
  currencyUnit: CurrencyUnitOption;
  amenities: RoomAmenityOption[];
  organization: OrganizationReference;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeUpsertRequest {
  guid?: string | null;
  /** Required when an admin creates a room type; ignored otherwise. */
  organizationGuid?: string | null;
  name: string;
  description: string | null;
  capacity: number;
  /** Decimal string with at most two decimal places, e.g. "1499.50". */
  costPerNight: string;
  currencyUnitGuid: string;
  amenityGuids: string[];
}

export type RoomTypeListQuery = PaginatedQuery<RoomTypeSortBy>;

export type RoomTypeListResponse = PaginatedResponse<RoomTypeListItem>;
