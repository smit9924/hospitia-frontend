import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { getBookingStatusOption } from '../../../data/booking-options';
import { FloorLabelPipe } from '../../../pipes/floor-label/floor-label-pipe';
import { Booking } from '../../../services/booking/booking';
import { BookingActionResult, BookingActions } from '../../../services/booking/booking-actions';
import { Profile } from '../../../services/profile';
import { UserType } from '../../../types/enums/auth';
import { BookingAction } from '../../../types/enums/booking';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { BookingDetail, UserReference } from '../../../types/interfaces/booking';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { PageHeader } from '../../common/page-header/page-header';
import { BookingGuestSummary } from '../booking-guest-summary/booking-guest-summary';

/** One step of the booking's history, e.g. "Checked in by Asha Rao". */
interface BookingTimelineEntry {
  label: string;
  at: string;
  by: string | null;
  note?: string | null;
}

/**
 * Everything about one booking: stay, price, guests (with full ID numbers)
 * and history, with the actions its status allows (edit, check in, check
 * out, cancel) in the page header.
 */
@Component({
  selector: 'app-booking-details',
  imports: [
    PageHeader,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    FloorLabelPipe,
    BookingGuestSummary,
  ],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss',
})
export class BookingDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(Booking);
  private readonly bookingActions = inject(BookingActions);
  private readonly profileService = inject(Profile);

  protected readonly bookingGuid = this.route.snapshot.queryParamMap.get('guid');
  protected readonly editBookingRoute = appRoutes.createBooking;
  protected readonly bookingListingRoute = appRoutes.bookingListing;
  protected readonly BookingAction = BookingAction;

  protected readonly booking = signal<BookingDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );

  protected readonly titleText = computed(() => this.booking()?.reference ?? $localize`Booking`);
  protected readonly statusOption = computed(() => {
    const booking = this.booking();
    return booking ? getBookingStatusOption(booking.status) : null;
  });
  protected readonly timeline = computed((): BookingTimelineEntry[] => {
    const booking = this.booking();
    if (!booking) {
      return [];
    }
    const entries: BookingTimelineEntry[] = [
      { label: $localize`Booked`, at: booking.createdAt, by: this.userName(booking.bookedBy) },
    ];
    if (booking.checkedInAt) {
      entries.push({
        label: $localize`Checked in`,
        at: booking.checkedInAt,
        by: this.userName(booking.checkedInBy),
      });
    }
    if (booking.checkedOutAt) {
      entries.push({
        label: $localize`Checked out`,
        at: booking.checkedOutAt,
        by: this.userName(booking.checkedOutBy),
      });
    }
    if (booking.cancelledAt) {
      entries.push({
        label: $localize`Cancelled`,
        at: booking.cancelledAt,
        by: this.userName(booking.cancelledBy),
        note: booking.cancellationReason,
      });
    }
    return entries;
  });

  ngOnInit(): void {
    if (this.bookingGuid) {
      this.loadBooking(this.bookingGuid);
    } else {
      this.isLoading.set(false);
      this.notFound.set(true);
    }
  }

  protected can(action: BookingAction): boolean {
    return this.booking()?.allowedActions.includes(action) ?? false;
  }

  protected checkIn(booking: BookingDetail): void {
    this.applyAction(this.bookingActions.checkIn(booking));
  }

  protected checkOut(booking: BookingDetail): void {
    this.applyAction(this.bookingActions.checkOut(booking));
  }

  protected cancel(booking: BookingDetail): void {
    this.applyAction(this.bookingActions.cancel(booking));
  }

  /** Shows the updated booking, or reloads it when the action failed. */
  private applyAction(action: Observable<BookingActionResult>): void {
    action.subscribe((booking) => {
      if (booking) {
        this.booking.set(booking);
      } else if (this.bookingGuid) {
        this.loadBooking(this.bookingGuid);
      }
    });
  }

  private loadBooking(guid: string): void {
    this.isLoading.set(true);
    this.bookingService
      .getBooking(guid)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (booking) => this.booking.set(booking),
        error: (error: HttpErrorResponse) => {
          const errorCode = (error.error as ApiErrorResponse<unknown> | null)?.errorCode;
          if (
            error.status === HttpStatusCode.NotFound ||
            errorCode === ErrorCodes.BOOKING_NOT_FOUND
          ) {
            this.notFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private userName(user: UserReference | null): string | null {
    if (!user) {
      return null;
    }
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
  }
}
