import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Booking } from '../../../services/booking/booking';
import { BookingActions } from '../../../services/booking/booking-actions';
import { Profile } from '../../../services/profile';
import { UserType } from '../../../types/enums/auth';
import { BookingAction, BookingStatus, Gender, IdProofType } from '../../../types/enums/booking';
import { BookingDetail } from '../../../types/interfaces/booking';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { BookingDetails } from './booking-details';

const detail: BookingDetail = {
  guid: 'booking-1',
  reference: 'BK-2026-000001',
  status: BookingStatus.CHECKED_IN,
  organization: { guid: 'org-1', name: 'Sunrise Guest House' },
  room: {
    guid: 'room-201',
    roomNumber: '201',
    floor: 2,
    roomType: { guid: 't1', name: 'Deluxe', capacity: 2 },
  },
  checkInDate: '2026-11-20',
  checkOutDate: '2026-11-25',
  nights: 5,
  guestCount: 2,
  costPerNight: '2500.00',
  totalAmount: '12500.00',
  currency: { guid: 'c1', currencyCode: 'INR', currencyName: 'Indian rupee', minorUnit: 2 },
  bookedBy: { guid: 'u1', firstName: 'Test', lastName: 'Owner' },
  bookedByRole: UserType.OWNER,
  createdAt: '2026-11-18T10:00:00',
  allowedActions: [BookingAction.EDIT, BookingAction.CHECK_OUT],
  notes: 'Late arrival',
  updatedAt: '2026-11-20T12:00:00',
  checkedInAt: '2026-11-20T12:00:00',
  checkedInBy: { guid: 'u2', firstName: 'Test', lastName: 'Manager' },
  checkedOutAt: null,
  checkedOutBy: null,
  cancelledAt: null,
  cancelledBy: null,
  cancellationReason: null,
  primaryGuest: {
    guid: 'g1',
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
  },
  secondaryGuests: [
    {
      guid: 'g2',
      firstName: 'Ravi',
      lastName: 'Rao',
      gender: Gender.MALE,
      dateOfBirth: '1988-01-09',
      phone: null,
      email: null,
      idProofType: null,
      idProofNumber: null,
      address: null,
      nationality: null,
    },
  ],
};

describe('BookingDetails', () => {
  let fixture: ComponentFixture<BookingDetails>;
  let element: HTMLElement;
  const bookingService = { getBooking: vi.fn() };
  const bookingActions = { checkIn: vi.fn(), checkOut: vi.fn(), cancel: vi.fn() };

  const render = async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {}, queryParamMap: convertToParamMap({ guid: 'booking-1' }) },
          },
        },
        { provide: Booking, useValue: bookingService },
        { provide: BookingActions, useValue: bookingActions },
        {
          provide: Profile,
          useValue: { userProfile: signal(new UserProfileModel({ role: UserType.OWNER })) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingDetails);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };
  const actionLabels = () =>
    Array.from(element.querySelectorAll('[pageHeaderActions] a, [pageHeaderActions] button')).map(
      (item) => item.textContent?.trim(),
    );

  beforeEach(() => {
    vi.clearAllMocks();
    bookingService.getBooking.mockReturnValue(of(structuredClone(detail)));
  });

  it('shows the stay, price, guests with full ID numbers and history', async () => {
    await render();

    expect(element.querySelector('h1')?.textContent).toContain('BK-2026-000001');
    expect(element.textContent).toContain('Checked in');
    expect(element.textContent).toContain('5 night(s) × INR 2,500.00');
    expect(element.textContent).toContain('INR 12,500.00');
    expect(element.textContent).toContain('Aadhaar 123412341234');
    expect(element.textContent).toContain('Ravi Rao');
    expect(element.textContent).toContain('Late arrival');
    expect(element.textContent).toContain('by Test Manager');
  });

  it('offers the actions the booking allows', async () => {
    await render();

    expect(actionLabels()).toEqual(['Edit', 'Check out']);
  });

  it('shows the updated booking after an action', async () => {
    bookingActions.checkOut.mockReturnValue(
      of({ ...detail, status: BookingStatus.CHECKED_OUT, allowedActions: [] }),
    );
    await render();

    element.querySelector<HTMLButtonElement>('[pageHeaderActions] button')!.click();
    await fixture.whenStable();

    expect(element.textContent).toContain('Checked out');
    expect(actionLabels()).toEqual([]);
  });

  it('reports a booking that does not exist', async () => {
    bookingService.getBooking.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 404, error: { errorCode: 2030, message: '' } }),
      ),
    );
    await render();

    expect(element.textContent).toContain('Booking not found');
  });
});
