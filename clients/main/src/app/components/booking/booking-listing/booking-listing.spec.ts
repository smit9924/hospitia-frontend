import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Booking } from '../../../services/booking/booking';
import { BookingActions } from '../../../services/booking/booking-actions';
import { Profile } from '../../../services/profile';
import { UserType } from '../../../types/enums/auth';
import { BookingAction, BookingStatus, IdProofType } from '../../../types/enums/booking';
import { BookingListItem } from '../../../types/interfaces/booking';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { BookingListing } from './booking-listing';

const listItem: BookingListItem = {
  guid: 'booking-1',
  reference: 'BK-2026-000001',
  status: BookingStatus.CONFIRMED,
  organization: { guid: 'org-1', name: 'Sunrise Guest House' },
  room: {
    guid: 'room-201',
    roomNumber: '201',
    floor: 2,
    roomType: { guid: 't1', name: 'Deluxe', capacity: 2 },
  },
  checkInDate: '2026-12-12',
  checkOutDate: '2026-12-15',
  nights: 3,
  guestCount: 2,
  costPerNight: '2500.00',
  totalAmount: '7500.00',
  currency: { guid: 'c1', currencyCode: 'INR', currencyName: 'Indian rupee', minorUnit: 2 },
  bookedBy: { guid: 'u1', firstName: 'Test', lastName: 'Owner' },
  bookedByRole: UserType.OWNER,
  createdAt: '2026-11-23T10:00:00',
  allowedActions: [BookingAction.EDIT, BookingAction.CANCEL],
  primaryGuest: {
    guid: 'g1',
    firstName: 'Asha',
    lastName: 'Rao',
    phone: '+91 98450 12345',
    idProofType: IdProofType.AADHAAR,
    idProofNumber: '••••••••1234',
  },
};

describe('BookingListing', () => {
  let fixture: ComponentFixture<BookingListing>;
  let element: HTMLElement;
  const bookingService = { list: vi.fn() };
  const bookingActions = { checkIn: vi.fn(), checkOut: vi.fn(), cancel: vi.fn() };

  const render = async (role: UserType, queryParams: Record<string, string | string[]> = {}) => {
    await TestBed.configureTestingModule({
      imports: [BookingListing],
      providers: [
        provideNativeDateAdapter(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: {}, queryParamMap: convertToParamMap(queryParams) } },
        },
        { provide: Booking, useValue: bookingService },
        { provide: BookingActions, useValue: bookingActions },
        { provide: Profile, useValue: { userProfile: signal(new UserProfileModel({ role })) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingListing);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };
  const headers = () =>
    Array.from(element.querySelectorAll('th')).map((header) => header.textContent?.trim());

  beforeEach(() => {
    vi.clearAllMocks();
    bookingService.list.mockReturnValue(
      of({ items: [listItem], totalCount: 1, pageNumber: 1, pageSize: 10 }),
    );
  });

  it('lists bookings with their guest, dates, guests and total', async () => {
    await render(UserType.OWNER);

    const row = {
      textContent: element.querySelector('tr[mat-row]')!.textContent!.replace(/\s+/g, ' '),
    };
    expect(row.textContent).toContain('BK-2026-000001');
    expect(row.textContent).toContain('Asha Rao');
    expect(row.textContent).toContain('12 Dec – 15 Dec 2026');
    expect(row.textContent).toContain('3 night(s)');
    expect(row.textContent).toContain('2 of 2 guests');
    expect(row.textContent).toContain('Room 201');
    expect(row.textContent).toContain('INR 7,500.00');
    expect(row.textContent).toContain('Confirmed');
    expect(headers()).not.toContain('Organization');
  });

  it('shows the organization column to admins', async () => {
    await render(UserType.ADMIN);

    expect(headers()).toContain('Organization');
  });

  it('applies filters passed in the address (e.g. from the dashboard)', async () => {
    await render(UserType.OWNER, {
      statuses: 'checked_in',
      fromDate: '2026-11-23',
      toDate: '2026-11-23',
    });

    expect(bookingService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [BookingStatus.CHECKED_IN],
        fromDate: '2026-11-23',
        toDate: '2026-11-23',
      }),
    );
  });

  it('offers only the actions the booking allows', async () => {
    await render(UserType.OWNER);
    element
      .querySelector<HTMLButtonElement>('button[aria-label="Actions for booking BK-2026-000001"]')!
      .click();
    await fixture.whenStable();

    const items = Array.from(document.querySelectorAll('[mat-menu-item]')).map((item) =>
      item.textContent?.trim(),
    );
    expect(items).toEqual(['View', 'Edit', 'Cancel']);
  });

  it('suggests creating a booking when there are none', async () => {
    bookingService.list.mockReturnValue(
      of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
    );
    await render(UserType.OWNER);

    expect(element.textContent).toContain('No bookings yet');
  });

  it('offers to clear filters when nothing matches', async () => {
    bookingService.list.mockReturnValue(
      of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
    );
    await render(UserType.OWNER, { statuses: 'cancelled' });

    expect(element.textContent).toContain('No bookings match these filters');
    expect(element.textContent).toContain('Clear filters');
  });
});
