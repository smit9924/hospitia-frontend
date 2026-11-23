import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Booking } from '../../../services/booking/booking';
import { Profile } from '../../../services/profile';
import { UserType } from '../../../types/enums/auth';
import { BookingAction, BookingStatus, Gender, IdProofType } from '../../../types/enums/booking';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { AvailableRoom, BookingDetail, BookingGuestInput } from '../../../types/interfaces/booking';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { addDaysToIsoDate, parseIsoDate, todayIsoDate } from '../../../utils/iso-date';
import { CreateBooking, formatRoomOption } from './create-booking';

const inr = { guid: 'cur-inr', currencyCode: 'INR', currencyName: 'Indian rupee', minorUnit: 2 };
const room201: AvailableRoom = {
  guid: 'room-201',
  roomNumber: '201',
  floor: 2,
  roomType: { guid: 'type-1', name: 'Deluxe double', capacity: 2, costPerNight: '2500.00' },
  currency: inr,
};
const primary: BookingGuestInput = {
  firstName: 'Asha',
  lastName: 'Rao',
  gender: Gender.FEMALE,
  dateOfBirth: '1990-05-17',
  phone: '+91 98450 12345',
  email: null,
  idProofType: IdProofType.AADHAAR,
  idProofNumber: '123412341234',
  address: null,
  nationality: null,
};
const checkIn = addDaysToIsoDate(todayIsoDate(), 5);
const checkOut = addDaysToIsoDate(todayIsoDate(), 8);

function bookingDetail(overrides: Partial<BookingDetail> = {}): BookingDetail {
  return {
    guid: 'booking-1',
    reference: 'BK-2026-000001',
    status: BookingStatus.CONFIRMED,
    organization: { guid: 'org-1', name: 'Sunrise Guest House' },
    room: { guid: 'room-201', roomNumber: '201', floor: 2, roomType: room201.roomType },
    checkInDate: checkIn,
    checkOutDate: checkOut,
    nights: 3,
    guestCount: 1,
    costPerNight: '2500.00',
    totalAmount: '7500.00',
    currency: inr,
    bookedBy: { guid: 'u1', firstName: 'Test', lastName: 'Owner' },
    bookedByRole: UserType.OWNER,
    createdAt: '2026-11-23T10:00:00',
    allowedActions: [BookingAction.EDIT, BookingAction.CANCEL],
    notes: null,
    updatedAt: '2026-11-23T10:00:00',
    checkedInAt: null,
    checkedInBy: null,
    checkedOutAt: null,
    checkedOutBy: null,
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
    primaryGuest: { ...primary, guid: 'guest-1' },
    secondaryGuests: [],
    ...overrides,
  };
}

describe('CreateBooking', () => {
  let fixture: ComponentFixture<CreateBooking>;
  let component: CreateBooking;
  let element: HTMLElement;
  const bookingService = {
    listAvailableRooms: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getBooking: vi.fn(),
  };

  const render = async (role: UserType, queryParams: Record<string, string> = {}) => {
    await TestBed.configureTestingModule({
      imports: [CreateBooking],
      providers: [
        provideNativeDateAdapter(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: {}, queryParamMap: convertToParamMap(queryParams) } },
        },
        { provide: Booking, useValue: bookingService },
        { provide: Profile, useValue: { userProfile: signal(new UserProfileModel({ role })) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CreateBooking);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  };
  const form = () => component['stayForm'];
  /** Picks the dates and waits for the debounced room search. */
  const chooseDates = async (from: string, to: string) => {
    vi.useFakeTimers();
    form().controls.checkInDate.setValue(parseIsoDate(from));
    form().controls.checkOutDate.setValue(parseIsoDate(to));
    vi.advanceTimersByTime(300);
    vi.useRealTimers();
    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    bookingService.listAvailableRooms.mockReturnValue(of([room201]));
  });

  it('formats room choices with floor, type and capacity', () => {
    expect(formatRoomOption(room201)).toBe('201 · Floor 2 · Deluxe double · 2 guests');
  });

  it('asks admins for the organization before dates and rooms', async () => {
    await render(UserType.ADMIN);

    expect(element.querySelector('app-organization-selection-field')).not.toBeNull();
    expect(form().controls.checkInDate.disabled).toBe(true);
    expect(form().controls.roomGuid.disabled).toBe(true);
  });

  it('lists the rooms free for the chosen dates and prices the stay', async () => {
    await render(UserType.OWNER);
    expect(form().controls.roomGuid.disabled).toBe(true);

    await chooseDates(checkIn, checkOut);
    form().controls.roomGuid.setValue('room-201');
    await fixture.whenStable();

    expect(bookingService.listAvailableRooms).toHaveBeenCalledWith({
      organizationGuid: null,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      excludeBookingGuid: null,
    });
    expect(element.querySelector('.booking-price')?.textContent).toContain(
      '3 night(s) × INR 2,500.00',
    );
    expect(element.querySelector('.booking-price')?.textContent).toContain('INR 7,500.00');
  });

  it('shows the back-dated notice and offers a completed stay for ended stays', async () => {
    await render(UserType.OWNER);

    await chooseDates(addDaysToIsoDate(todayIsoDate(), -3), todayIsoDate());

    expect(element.textContent).toContain('This booking is back-dated.');
    expect(element.textContent).toContain('Record as completed stay');
  });

  it('clears a room that is no longer free for new dates', async () => {
    await render(UserType.OWNER);
    await chooseDates(checkIn, checkOut);
    form().controls.roomGuid.setValue('room-201');
    bookingService.listAvailableRooms.mockReturnValue(of([]));

    await chooseDates(checkIn, addDaysToIsoDate(checkOut, 1));

    expect(form().controls.roomGuid.value).toBeNull();
    expect(component['clearedRoomNumber']()).toBe('201');
  });

  it('does not save without a primary guest', async () => {
    await render(UserType.OWNER);
    await chooseDates(checkIn, checkOut);
    form().controls.roomGuid.setValue('room-201');

    component['onSubmit']();

    expect(bookingService.create).not.toHaveBeenCalled();
  });

  it('creates the booking and opens its details', async () => {
    bookingService.create.mockReturnValue(of(bookingDetail()));
    await render(UserType.OWNER);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await chooseDates(checkIn, checkOut);
    form().controls.roomGuid.setValue('room-201');
    component['primaryGuest'].set(primary);

    component['onSubmit']();

    expect(bookingService.create).toHaveBeenCalledWith({
      organizationGuid: null,
      recordAsCompletedStay: false,
      roomGuid: 'room-201',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      notes: null,
      primaryGuest: primary,
      secondaryGuests: [],
    });
    expect(navigate).toHaveBeenCalledWith(['/booking/details'], {
      queryParams: { guid: 'booking-1' },
    });
  });

  it("shows the server's reason when the room was taken meanwhile", async () => {
    bookingService.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: {
              errorCode: ErrorCodes.BOOKING_ROOM_UNAVAILABLE,
              message: 'Room 201 is already booked for part of these dates.',
            },
          }),
      ),
    );
    await render(UserType.OWNER);
    await chooseDates(checkIn, checkOut);
    form().controls.roomGuid.setValue('room-201');
    component['primaryGuest'].set(primary);

    component['onSubmit']();
    await fixture.whenStable();

    expect(element.querySelector('app-banner')?.textContent).toContain(
      'Room 201 is already booked for part of these dates.',
    );
  });

  it('keeps the room and check-in date of a checked-in booking', async () => {
    bookingService.getBooking.mockReturnValue(
      of(bookingDetail({ status: BookingStatus.CHECKED_IN })),
    );
    await render(UserType.OWNER, { guid: 'booking-1' });

    expect(form().controls.checkInDate.disabled).toBe(true);
    expect(form().controls.roomGuid.disabled).toBe(true);
    expect(form().controls.checkOutDate.enabled).toBe(true);
    expect(component['primaryGuest']()?.guid).toBe('guest-1');
  });

  it('shows cancelled bookings as read-only', async () => {
    bookingService.getBooking.mockReturnValue(
      of(bookingDetail({ status: BookingStatus.CANCELLED })),
    );
    await render(UserType.OWNER, { guid: 'booking-1' });

    expect(element.textContent).toContain('This booking can no longer be changed');
    expect(element.querySelector('form')).toBeNull();
  });
});
