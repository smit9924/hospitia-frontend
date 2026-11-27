import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiRoutes } from '../../data/api-routes';
import { BookingStatus } from '../../types/enums/booking';
import { Booking } from './booking';

describe('Booking', () => {
  let service: Booking;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Booking);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('lists bookings with repeated statuses and the date range', () => {
    service
      .list({
        searchTerm: 'BK-2026',
        statuses: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
        fromDate: '2026-12-01',
        toDate: '2026-12-31',
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'checkInDate',
        sortDirection: 'desc',
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === apiRoutes.booking.list);
    expect(request.request.params.getAll('statuses')).toEqual(['confirmed', 'checked_in']);
    expect(request.request.params.get('fromDate')).toBe('2026-12-01');
    expect(request.request.params.get('toDate')).toBe('2026-12-31');
    expect(request.request.params.get('pageNumber')).toBe('2');
    request.flush({ items: [], totalCount: 0, pageNumber: 2, pageSize: 10 });
  });

  it('leaves out empty date filters', () => {
    service
      .list({
        searchTerm: '',
        statuses: [],
        fromDate: null,
        toDate: null,
        pageSize: 10,
        pageNumber: 1,
        sortBy: 'checkInDate',
        sortDirection: 'desc',
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === apiRoutes.booking.list);
    expect(request.request.params.has('fromDate')).toBe(false);
    expect(request.request.params.has('statuses')).toBe(false);
    request.flush({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 });
  });

  it('asks for free rooms, sending the organization and the edited booking only when set', () => {
    service
      .listAvailableRooms({
        organizationGuid: null,
        checkInDate: '2026-12-12',
        checkOutDate: '2026-12-15',
        excludeBookingGuid: 'booking-1',
      })
      .subscribe();

    const request = httpTesting.expectOne((req) => req.url === apiRoutes.booking.availableRooms);
    expect(request.request.params.has('organizationGuid')).toBe(false);
    expect(request.request.params.get('excludeBookingGuid')).toBe('booking-1');
    expect(request.request.params.get('checkInDate')).toBe('2026-12-12');
    request.flush([]);
  });

  it.each([
    ['checkIn', apiRoutes.booking.checkIn],
    ['checkOut', apiRoutes.booking.checkOut],
  ] as const)('%s posts the booking guid', (method, url) => {
    service[method]('booking-1').subscribe();

    const request = httpTesting.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ guid: 'booking-1' });
    request.flush({});
  });

  it('cancels with the reason', () => {
    service.cancel({ guid: 'booking-1', reason: 'Guest request' }).subscribe();

    const request = httpTesting.expectOne(apiRoutes.booking.cancel);
    expect(request.request.body).toEqual({ guid: 'booking-1', reason: 'Guest request' });
    request.flush({});
  });

  it("gets today's summary for the given local date", () => {
    service.getTodaySummary('2026-11-23').subscribe();

    const request = httpTesting.expectOne((req) => req.url === apiRoutes.booking.todaySummary);
    expect(request.request.params.get('onDate')).toBe('2026-11-23');
    request.flush({ arrivals: 0, departures: 0, inHouse: 0 });
  });
});
