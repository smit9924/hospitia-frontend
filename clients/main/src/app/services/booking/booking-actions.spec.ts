import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { GenericSnackbarType } from '../../types/enums/common';
import { ErrorCodes } from '../../types/enums/error-codes';
import { GenericSnackbarConfig } from '../../types/models/common/generic-snackbar/generic-snackbar-config';
import { addDaysToIsoDate, todayIsoDate } from '../../utils/iso-date';
import { Dialog } from '../dialog';
import { Snackbar } from '../snackbar';
import { Booking } from './booking';
import { BookingActionResult, BookingActions } from './booking-actions';

describe('BookingActions', () => {
  let actions: BookingActions;
  const bookingService = { checkIn: vi.fn(), checkOut: vi.fn(), cancel: vi.fn() };
  const snackbarService = { open: vi.fn() };
  const dialogService = { openConfirmDialog: vi.fn() };
  const matDialog = { open: vi.fn() };
  const target = { guid: 'b1', reference: 'BK-2026-000001', checkOutDate: '2026-12-15' };
  const updated = { guid: 'b1', reference: 'BK-2026-000001' };

  const confirmWith = (answer: boolean) =>
    dialogService.openConfirmDialog.mockReturnValue({ afterClosed: () => of(answer) });
  const lastSnackbar = () =>
    (snackbarService.open.mock.lastCall?.[0] as GenericSnackbarConfig).data!;
  const results = (source: { subscribe: (next: (value: BookingActionResult) => void) => void }) => {
    const emitted: BookingActionResult[] = [];
    source.subscribe((value) => emitted.push(value));
    return emitted;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Booking, useValue: bookingService },
        { provide: Snackbar, useValue: snackbarService },
        { provide: Dialog, useValue: dialogService },
        { provide: MatDialog, useValue: matDialog },
      ],
    });
    actions = TestBed.inject(BookingActions);
  });

  it('checks in after confirmation and reports success', () => {
    confirmWith(true);
    bookingService.checkIn.mockReturnValue(of(updated));

    expect(results(actions.checkIn(target))).toEqual([updated]);
    expect(bookingService.checkIn).toHaveBeenCalledWith('b1');
    expect(lastSnackbar().text).toBe('Guests checked in for BK-2026-000001.');
  });

  it('does nothing when the confirmation is dismissed', () => {
    confirmWith(false);

    expect(results(actions.checkIn(target))).toEqual([]);
    expect(bookingService.checkIn).not.toHaveBeenCalled();
  });

  it("shows the server's explanation and emits null when the action is refused", () => {
    confirmWith(true);
    bookingService.checkIn.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: {
              errorCode: ErrorCodes.BOOKING_INVALID_STATUS_TRANSITION,
              message: 'Guests can check in from the check-in date.',
            },
          }),
      ),
    );

    expect(results(actions.checkIn(target))).toEqual([null]);
    expect(lastSnackbar().text).toBe('Guests can check in from the check-in date.');
    expect(lastSnackbar().type).toBe(GenericSnackbarType.ERROR);
  });

  it('warns that an early check-out moves the date to today', () => {
    confirmWith(true);
    bookingService.checkOut.mockReturnValue(of(updated));

    results(actions.checkOut({ ...target, checkOutDate: addDaysToIsoDate(todayIsoDate(), 2) }));

    expect(dialogService.openConfirmDialog.mock.lastCall?.[1]).toContain('leaving early');
  });

  it('cancels with the reason given in the cancel dialog', () => {
    matDialog.open.mockReturnValue({ afterClosed: () => of({ reason: 'Guest request' }) });
    bookingService.cancel.mockReturnValue(of(updated));

    expect(results(actions.cancel(target))).toEqual([updated]);
    expect(bookingService.cancel).toHaveBeenCalledWith({ guid: 'b1', reason: 'Guest request' });
    expect(lastSnackbar().text).toBe('Booking BK-2026-000001 cancelled.');
  });
});
