import { UserType } from '../enums/auth';
import { BookingAction, BookingStatus, Gender, IdProofType } from '../enums/booking';
import { CurrencyUnitOption } from './currency-unit';
import { PaginatedResponse } from './pagination';
import { OrganizationReference } from './room-amenity';

/** Public reference to a user (e.g. who booked or checked in). */
export interface UserReference {
  guid: string;
  firstName: string | null;
  lastName: string | null;
}

/** The booked room's type and the number of guests it fits. */
export interface BookingRoomTypeReference {
  guid: string;
  name: string;
  capacity: number;
}

/** The booked room. */
export interface BookingRoomReference {
  guid: string;
  roomNumber: string;
  floor: number;
  roomType: BookingRoomTypeReference;
}

/** Guest fields entered in the guest dialog and sent on save. */
export interface BookingGuestInput {
  /** Identifies an existing guest of the booking being edited; absent for a new guest. */
  guid?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  /** ISO date, e.g. "1990-05-17". */
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  idProofType: IdProofType | null;
  idProofNumber: string | null;
  address: string | null;
  nationality: string | null;
}

/** A saved guest; `idProofNumber` is masked except in the booking details. */
export interface BookingGuest extends BookingGuestInput {
  guid: string;
}

/** The primary guest as shown in the listing (ID number masked). */
export interface BookingPrimaryGuestSummary {
  guid: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  idProofType: IdProofType | null;
  idProofNumber: string | null;
}

/** Fields shared by the listing row and the details. Dates are ISO dates; amounts decimal strings. */
export interface BookingSummary {
  guid: string;
  reference: string;
  status: BookingStatus;
  organization: OrganizationReference;
  room: BookingRoomReference;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCount: number;
  costPerNight: string;
  totalAmount: string;
  currency: CurrencyUnitOption;
  bookedBy: UserReference;
  bookedByRole: UserType;
  createdAt: string;
  allowedActions: BookingAction[];
}

export interface BookingListItem extends BookingSummary {
  primaryGuest: BookingPrimaryGuestSummary | null;
}

/** A booking with its guests (full ID numbers) and status history. */
export interface BookingDetail extends BookingSummary {
  notes: string | null;
  updatedAt: string;
  checkedInAt: string | null;
  checkedInBy: UserReference | null;
  checkedOutAt: string | null;
  checkedOutBy: UserReference | null;
  cancelledAt: string | null;
  cancelledBy: UserReference | null;
  cancellationReason: string | null;
  primaryGuest: BookingGuest | null;
  secondaryGuests: BookingGuest[];
}

/** Stay fields shared by the create and update requests. */
export interface BookingStayRequest {
  roomGuid: string;
  checkInDate: string;
  checkOutDate: string;
  notes: string | null;
  primaryGuest: BookingGuestInput;
  secondaryGuests: BookingGuestInput[];
}

export interface BookingCreateRequest extends BookingStayRequest {
  /** Required when an admin books; owners and managers send null. */
  organizationGuid: string | null;
  /** Saves a stay that has already ended directly as checked out. */
  recordAsCompletedStay: boolean;
}

/** Updates the booking identified by `guid` with its complete guest list. */
export interface BookingUpdateRequest extends BookingStayRequest {
  guid: string;
}

export interface BookingCancelRequest {
  guid: string;
  reason: string | null;
}

export type BookingSortBy = 'checkInDate' | 'createdAt';

/** Listing search, filters and pagination. Dates are ISO dates; the range is inclusive. */
export interface BookingListQuery {
  searchTerm: string;
  statuses: BookingStatus[];
  fromDate: string | null;
  toDate: string | null;
  pageSize: number;
  pageNumber: number;
  sortBy: BookingSortBy;
  sortDirection: 'asc' | 'desc';
}

export type BookingListResponse = PaginatedResponse<BookingListItem>;

export interface AvailableRoomsQuery {
  /** Admins only; owners and managers search their active organization. */
  organizationGuid: string | null;
  checkInDate: string;
  checkOutDate: string;
  /** The booking being edited, so its own room is offered too. */
  excludeBookingGuid: string | null;
}

/** A room free for the requested stay, with what the form needs to price it. */
export interface AvailableRoom {
  guid: string;
  roomNumber: string;
  floor: number;
  roomType: BookingRoomTypeReference & { costPerNight: string };
  currency: CurrencyUnitOption;
}

/** Today's activity of the active organization. */
export interface BookingTodaySummary {
  arrivals: number;
  departures: number;
  inHouse: number;
}

/** The booking holding a room on the dashboard's date. */
export interface RoomOccupancy {
  bookingGuid: string;
  reference: string;
  status: BookingStatus;
  primaryGuestName: string | null;
  checkInDate: string;
  checkOutDate: string;
  isArriving: boolean;
  isDeparting: boolean;
}
