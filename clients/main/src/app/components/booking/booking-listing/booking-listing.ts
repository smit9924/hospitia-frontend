import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import {
  bookingStatusOptions,
  BookingStatusOption,
  getBookingStatusOption,
} from '../../../data/booking-options';
import { FloorLabelPipe } from '../../../pipes/floor-label/floor-label-pipe';
import { Booking } from '../../../services/booking/booking';
import { BookingActionResult, BookingActions } from '../../../services/booking/booking-actions';
import { Profile } from '../../../services/profile';
import { UserType } from '../../../types/enums/auth';
import { BookingAction, BookingStatus } from '../../../types/enums/booking';
import { BookingListItem, BookingSortBy } from '../../../types/interfaces/booking';
import { parseIsoDate, toIsoDate } from '../../../utils/iso-date';
import { PageHeader } from '../../common/page-header/page-header';
import { Searchbar } from '../../common/searchbar/searchbar';

const DEFAULT_SORT_BY: BookingSortBy = 'checkInDate';
const BOOKING_STATUSES = new Set<string>(Object.values(BookingStatus));

/**
 * Listing of bookings, searchable by reference, primary guest name or
 * phone, or room number, and filterable by status and stay dates. Owners
 * and managers see their active organization's bookings; admins see every
 * organization's, with an organization column.
 *
 * Filters can be preset with the `statuses`, `fromDate` and `toDate` query
 * parameters (e.g. from the dashboard's "Arrivals" tile).
 */
@Component({
  selector: 'app-booking-listing',
  imports: [
    PageHeader,
    Searchbar,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    FloorLabelPipe,
  ],
  templateUrl: './booking-listing.html',
  styleUrl: './booking-listing.scss',
})
export class BookingListing implements OnInit {
  private readonly bookingService = inject(Booking);
  private readonly bookingActions = inject(BookingActions);
  private readonly profileService = inject(Profile);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly titleText = $localize`Bookings`;
  protected readonly descriptionText = $localize`Stays booked in your guest houses, with their guests.`;
  protected readonly pageSizeOptions = [5, 10, 25, 50];
  protected readonly statusOptions = bookingStatusOptions;
  protected readonly BookingAction = BookingAction;

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );
  /** The organization column only matters to admins, who see every organization. */
  protected readonly displayedColumns = computed(() => {
    const columns = ['reference', 'primaryGuest', 'stay', 'total', 'status', 'bookedBy'];
    return this.isAdmin() ? [...columns, 'organization', 'actions'] : [...columns, 'actions'];
  });

  protected readonly filters = new FormGroup({
    statuses: new FormControl<BookingStatus[]>([], { nonNullable: true }),
    fromDate: new FormControl<Date | null>(null),
    toDate: new FormControl<Date | null>(null),
  });

  protected readonly bookings = signal<BookingListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<BookingSortBy>(DEFAULT_SORT_BY);
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasActiveFilters = signal(false);
  protected readonly hasBookings = computed(() => this.totalCount() > 0);
  protected readonly isFilteredEmpty = computed(
    () => !this.hasBookings() && (!!this.searchTerm() || this.hasActiveFilters()),
  );

  ngOnInit(): void {
    this.applyQueryParamFilters();
    this.loadBookings();
  }

  protected statusOption(status: BookingStatus): BookingStatusOption {
    return getBookingStatusOption(status);
  }

  protected can(booking: BookingListItem, action: BookingAction): boolean {
    return booking.allowedActions.includes(action);
  }

  protected getActionsMenuLabel(booking: BookingListItem): string {
    return $localize`Actions for booking ${booking.reference}`;
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.reloadFromFirstPage();
  }

  protected applyFilters(): void {
    this.reloadFromFirstPage();
  }

  protected clearFilters(): void {
    this.filters.reset({ statuses: [], fromDate: null, toDate: null });
    this.reloadFromFirstPage();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as BookingSortBy) || DEFAULT_SORT_BY);
    this.sortDirection.set(sort.direction === 'asc' ? 'asc' : 'desc');
    this.reloadFromFirstPage();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadBookings();
  }

  protected createBooking(): void {
    void this.router.navigateByUrl(appRoutes.createBooking);
  }

  protected viewBooking(booking: BookingListItem): void {
    void this.router.navigate([appRoutes.bookingDetails], { queryParams: { guid: booking.guid } });
  }

  protected editBooking(booking: BookingListItem): void {
    void this.router.navigate([appRoutes.createBooking], { queryParams: { guid: booking.guid } });
  }

  protected checkIn(booking: BookingListItem): void {
    this.reloadAfter(this.bookingActions.checkIn(booking));
  }

  protected checkOut(booking: BookingListItem): void {
    this.reloadAfter(this.bookingActions.checkOut(booking));
  }

  protected cancel(booking: BookingListItem): void {
    this.reloadAfter(this.bookingActions.cancel(booking));
  }

  /** Refreshes the page once an action finished (or failed: the row may have changed). */
  private reloadAfter(action: Observable<BookingActionResult>): void {
    action.subscribe(() => this.loadBookings());
  }

  private reloadFromFirstPage(): void {
    this.pageIndex.set(0);
    this.loadBookings();
  }

  /** Presets the filters from `statuses`, `fromDate` and `toDate` query parameters. */
  private applyQueryParamFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const isIsoDate = (value: string | null): value is string =>
      !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
    const fromDate = params.get('fromDate');
    const toDate = params.get('toDate');
    this.filters.setValue({
      statuses: params
        .getAll('statuses')
        .filter((status): status is BookingStatus => BOOKING_STATUSES.has(status)),
      fromDate: isIsoDate(fromDate) ? parseIsoDate(fromDate) : null,
      toDate: isIsoDate(toDate) ? parseIsoDate(toDate) : null,
    });
  }

  private loadBookings(): void {
    const { statuses, fromDate, toDate } = this.filters.getRawValue();
    this.hasActiveFilters.set(statuses.length > 0 || !!fromDate || !!toDate);
    this.bookingService
      .list({
        searchTerm: this.searchTerm(),
        statuses,
        fromDate: fromDate ? toIsoDate(fromDate) : null,
        toDate: toDate ? toIsoDate(toDate) : null,
        pageSize: this.pageSize(),
        pageNumber: this.pageIndex() + 1,
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.bookings.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }
}
