import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  BookingCancelDialog,
  BookingCancelDialogData,
  BookingCancelDialogResult,
} from '../../components/booking/booking-cancel-dialog/booking-cancel-dialog';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../types/enums/common';
import { ErrorCodes } from '../../types/enums/error-codes';
import { BookingDetail } from '../../types/interfaces/booking';
import { ApiErrorResponse } from '../../types/interfaces/common';
import { GenericSnackbarConfig } from '../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { todayIsoDate } from '../../utils/iso-date';
import { Dialog } from '../dialog';
import { Snackbar } from '../snackbar';
import { Booking } from './booking';

/** The booking fields the lifecycle actions need. */
export interface BookingActionTarget {
  guid: string;
  reference: string;
  checkOutDate: string;
}

/**
 * Outcome of a lifecycle action: the updated booking, or `null` when it
 * failed (the booking may have changed elsewhere, so callers reload it).
 * Nothing is emitted when the user dismisses the confirmation.
 */
export type BookingActionResult = BookingDetail | null;

/** Errors whose server message explains the problem to the user as is. */
const EXPLAINED_ERRORS = new Set<ErrorCodes>([
  ErrorCodes.BOOKING_INVALID_STATUS_TRANSITION,
  ErrorCodes.BOOKING_NOT_FOUND,
]);

/**
 * Check-in, check-out and cancel flows shared by the booking listing and
 * details: confirm with the user, call the API, then report the outcome in
 * a snackbar.
 */
@Injectable({
  providedIn: 'root',
})
export class BookingActions {
  private readonly bookingService = inject(Booking);
  private readonly dialogService = inject(Dialog);
  private readonly matDialog = inject(MatDialog);
  private readonly snackbarService = inject(Snackbar);

  checkIn(booking: BookingActionTarget): Observable<BookingActionResult> {
    return this.confirm(
      $localize`Check in guests`,
      $localize`Check in the guests of booking ${booking.reference}?`,
    ).pipe(
      switchMap(() => this.bookingService.checkIn(booking.guid)),
      this.reportOutcome($localize`Guests checked in for ${booking.reference}.`),
    );
  }

  checkOut(booking: BookingActionTarget): Observable<BookingActionResult> {
    const isEarly = todayIsoDate() < booking.checkOutDate;
    return this.confirm(
      $localize`Check out guests`,
      isEarly
        ? $localize`The guests of booking ${booking.reference} are leaving early. The check-out date will change to today and the total will be recalculated.`
        : $localize`Check out the guests of booking ${booking.reference}?`,
    ).pipe(
      switchMap(() => this.bookingService.checkOut(booking.guid)),
      this.reportOutcome($localize`Booking ${booking.reference} checked out.`),
    );
  }

  cancel(booking: BookingActionTarget): Observable<BookingActionResult> {
    return this.matDialog
      .open<BookingCancelDialog, BookingCancelDialogData, BookingCancelDialogResult | null>(
        BookingCancelDialog,
        {
          data: { reference: booking.reference },
          width: '480px',
          maxWidth: '95vw',
          panelClass: 'full-screen-dialog-mobile',
        },
      )
      .afterClosed()
      .pipe(
        filter((result): result is BookingCancelDialogResult => !!result),
        switchMap(({ reason }) => this.bookingService.cancel({ guid: booking.guid, reason })),
        this.reportOutcome($localize`Booking ${booking.reference} cancelled.`),
      );
  }

  private confirm(title: string, text: string): Observable<true> {
    return this.dialogService
      .openConfirmDialog(title, text)
      .afterClosed()
      .pipe(filter((confirmed): confirmed is true => confirmed === true));
  }

  /** Shows the success or error snackbar and maps failures to `null`. */
  private reportOutcome(successMessage: string) {
    return (source: Observable<BookingDetail>): Observable<BookingActionResult> =>
      source.pipe(
        tap(() => this.showSnackbar(successMessage, GenericSnackbarType.SUCCESS)),
        map((booking): BookingActionResult => booking),
        catchError((error: HttpErrorResponse) => {
          const response = error.error as ApiErrorResponse<unknown> | null;
          this.showSnackbar(
            response && EXPLAINED_ERRORS.has(response.errorCode)
              ? response.message
              : $localize`The booking could not be updated. Please try again.`,
            GenericSnackbarType.ERROR,
          );
          return of(null);
        }),
      );
  }

  private showSnackbar(text: string, type: GenericSnackbarType): void {
    this.snackbarService.open(
      new GenericSnackbarConfig({
        data: new GenericSnackbarConfigData({ text, type }),
        duration: GenericSnackbarDuration.MEDIUM,
      }),
    );
  }
}
