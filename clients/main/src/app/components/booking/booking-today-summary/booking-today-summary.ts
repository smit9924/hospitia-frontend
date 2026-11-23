import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Booking } from '../../../services/booking/booking';
import { Organization } from '../../../services/organization/organization';
import { BookingStatus } from '../../../types/enums/booking';
import { BookingTodaySummary } from '../../../types/interfaces/booking';
import { todayIsoDate } from '../../../utils/iso-date';

/** One "today" tile: a count and the listing filters that show those bookings. */
interface TodayTile {
  label: string;
  description: string;
  icon: string;
  count: number;
  queryParams: Params;
}

/**
 * Dashboard tiles with today's arrivals, departures and in-house bookings
 * of the active organization (owners and managers). Each tile opens the
 * booking listing filtered to those bookings. "Today" is the user's local
 * date.
 */
@Component({
  selector: 'app-booking-today-summary',
  imports: [MatIconModule, RouterLink],
  templateUrl: './booking-today-summary.html',
  styleUrl: './booking-today-summary.scss',
})
export class BookingTodaySummaryTiles {
  private readonly bookingService = inject(Booking);
  private readonly organizationService = inject(Organization);

  protected readonly bookingListingRoute = appRoutes.bookingListing;
  protected readonly summary = signal<BookingTodaySummary | null>(null);
  protected readonly hasLoadError = signal(false);

  protected readonly tiles = computed((): TodayTile[] => {
    const summary = this.summary();
    const today = todayIsoDate();
    return [
      {
        label: $localize`Arrivals`,
        description: $localize`Checking in today`,
        icon: 'arrowRight',
        count: summary?.arrivals ?? 0,
        queryParams: { statuses: BookingStatus.CONFIRMED, fromDate: today, toDate: today },
      },
      {
        label: $localize`Departures`,
        description: $localize`Checking out today`,
        icon: 'logout',
        count: summary?.departures ?? 0,
        queryParams: { statuses: BookingStatus.CHECKED_IN, fromDate: today, toDate: today },
      },
      {
        label: $localize`In house`,
        description: $localize`Guests checked in`,
        icon: 'bed',
        count: summary?.inHouse ?? 0,
        queryParams: { statuses: BookingStatus.CHECKED_IN },
      },
    ];
  });

  constructor() {
    // Load on start and again whenever the active organization changes.
    const activeOrganizationGuid = computed(
      () => this.organizationService.activeOrganization()?.guid,
    );
    effect(() => {
      activeOrganizationGuid();
      untracked(() => this.loadSummary());
    });
  }

  protected tileLabel(tile: TodayTile): string {
    return $localize`${tile.count} ${tile.label}. ${tile.description}. Show these bookings`;
  }

  private loadSummary(): void {
    this.hasLoadError.set(false);
    this.bookingService.getTodaySummary(todayIsoDate()).subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.hasLoadError.set(true),
    });
  }
}
