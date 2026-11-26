import { RoomStatus } from '../enums/room';
import { PaginatedQuery, PaginatedResponse } from './pagination';
import { OrganizationReference } from './room-amenity';
import { RoomTypeOption } from './room-type';

export type RoomSortBy = 'roomNumber' | 'floor' | 'createdAt' | 'updatedAt';

/** An individual room (e.g. "101") of one organization. */
export interface RoomListItem {
  guid: string;
  roomNumber: string;
  /** -500 to 500; 0 is the ground floor, negative numbers are basements. */
  floor: number;
  status: RoomStatus;
  notes: string | null;
  roomType: RoomTypeOption;
  organization: OrganizationReference;
  createdAt: string;
  updatedAt: string;
}

/** Room fields shared by the create and update requests. */
export interface RoomAttributes {
  roomNumber: string;
  floor: number;
  roomTypeGuid: string;
  status: RoomStatus;
  notes: string | null;
}

export interface RoomCreateRequest extends RoomAttributes {
  /** Required when an admin creates a room; owners and managers send null. */
  organizationGuid: string | null;
}

/** Updates the room identified by `guid`; its organization never changes. */
export interface RoomUpdateRequest extends RoomAttributes {
  guid: string;
}

/** A room as drawn on the dashboard floor chart. */
export interface RoomFloorOverviewItem {
  guid: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  notes: string | null;
  roomType: RoomTypeOption;
}

/** Every active room of the active organization, top floor first. */
export interface RoomFloorOverviewResponse {
  rooms: RoomFloorOverviewItem[];
}

/** Changes only the status of the room identified by `guid`. */
export interface RoomStatusUpdateRequest {
  guid: string;
  status: RoomStatus;
}

export type RoomListQuery = PaginatedQuery<RoomSortBy>;

export type RoomListResponse = PaginatedResponse<RoomListItem>;
