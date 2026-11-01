import { PaginatedQuery, PaginatedResponse } from './pagination';

export type RoomAmenitySortBy = 'name' | 'createdAt' | 'updatedAt';

/** Minimal organization reference (e.g. the owner of a custom amenity, or an admin's pick). */
export interface OrganizationReference {
  guid: string;
  name: string;
}

/** A room amenity as returned by the room amenity management APIs. */
export interface RoomAmenityListItem {
  guid: string;
  name: string;
  description: string | null;
  /** Default amenities are managed by admins and offered to every organization. */
  isDefault: boolean;
  /** Owning organization of a custom amenity; null for a default amenity. */
  organization: OrganizationReference | null;
  createdAt: string;
  updatedAt: string;
}

/** Room amenity offered for selection on a room type. */
export interface RoomAmenityOption {
  guid: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

export interface RoomAmenityCreateRequest {
  name: string;
  description: string | null;
  /**
   * Read only for admins: null creates a default amenity, a GUID creates a
   * custom amenity of that organization. Owners and managers send null; the
   * backend uses their active organization.
   */
  organizationGuid: string | null;
}

/** Updates the amenity identified by `guid`; its scope never changes. */
export interface RoomAmenityUpdateRequest {
  guid: string;
  name: string;
  description: string | null;
}

export type RoomAmenityListQuery = PaginatedQuery<RoomAmenitySortBy>;

export type RoomAmenityListResponse = PaginatedResponse<RoomAmenityListItem>;
