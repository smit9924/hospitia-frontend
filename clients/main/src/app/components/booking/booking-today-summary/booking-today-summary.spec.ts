import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Booking } from '../../../services/booking/booking';
import { Organization } from '../../../services/organization/organization';
import { todayIsoDate } from '../../../utils/iso-date';
import { BookingTodaySummaryTiles } from './booking-today-summary';

describe('BookingTodaySummaryTiles', () => {
  const bookingService = { getTodaySummary: vi.fn() };

  const render = async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTodaySummaryTiles],
      providers: [
        provideRouter([]),
        { provide: Booking, useValue: bookingService },
        { provide: Organization, useValue: { activeOrganization: signal({ guid: 'org-1' }) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(BookingTodaySummaryTiles);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    bookingService.getTodaySummary.mockReturnValue(of({ arrivals: 2, departures: 1, inHouse: 4 }));
  });

  it("loads today's counts for the user's local date", async () => {
    const element = await render();

    expect(bookingService.getTodaySummary).toHaveBeenCalledWith(todayIsoDate());
    const counts = Array.from(element.querySelectorAll('.booking-today-count')).map((count) =>
      count.textContent?.trim(),
    );
    expect(counts).toEqual(['2', '1', '4']);
  });

  it('links each tile to the matching bookings', async () => {
    const element = await render();
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a.booking-today-tile'));

    expect(links[0].getAttribute('href')).toContain('statuses=confirmed');
    expect(links[0].getAttribute('href')).toContain(`fromDate=${todayIsoDate()}`);
    expect(links[2].getAttribute('href')).toContain('statuses=checked_in');
    expect(links[0].getAttribute('aria-label')).toBe(
      '2 Arrivals. Checking in today. Show these bookings',
    );
  });
});
