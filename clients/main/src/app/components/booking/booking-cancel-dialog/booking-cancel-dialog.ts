import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/** Limit shared with the backend (booking service `Booking.cancellation_reason`). */
export const CANCELLATION_REASON_MAX_LENGTH = 500;

/** Data passed to the cancel booking dialog. */
export interface BookingCancelDialogData {
  reference: string;
}

/** Result of the cancel booking dialog when the user confirms. */
export interface BookingCancelDialogResult {
  reason: string | null;
}

/**
 * Asks to confirm cancelling a booking, with an optional reason that is
 * shown in the booking's history and the guest's cancellation email.
 * Closes with the reason when confirmed, or with null when dismissed.
 */
@Component({
  selector: 'app-booking-cancel-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './booking-cancel-dialog.html',
  styleUrl: './booking-cancel-dialog.scss',
})
export class BookingCancelDialog {
  private readonly dialogRef = inject(
    MatDialogRef<BookingCancelDialog, BookingCancelDialogResult | null>,
  );
  protected readonly reference = inject<BookingCancelDialogData>(MAT_DIALOG_DATA).reference;
  protected readonly reasonMaxLength = CANCELLATION_REASON_MAX_LENGTH;

  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(CANCELLATION_REASON_MAX_LENGTH)],
  });

  protected confirm(): void {
    if (this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    this.dialogRef.close({ reason: this.reason.value.trim() || null });
  }

  protected close(): void {
    this.dialogRef.close(null);
  }
}
