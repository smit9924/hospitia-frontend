import { Component, computed, inject, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { Dialog } from '../../../services/dialog';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { BookingGuestSummary } from '../booking-guest-summary/booking-guest-summary';
import {
  GuestDetailsDialog,
  GuestDetailsDialogData,
} from '../guest-details-dialog/guest-details-dialog';

/**
 * Guests of the booking form: the primary guest (the contact person) and
 * the secondary guests, each added and edited in a popup.
 *
 * Primary + secondary guests never exceed the room's `capacity`; "Add
 * guest" is disabled, with a visible reason, until a room is chosen and
 * once the room is full. The server checks the same rule on save.
 */
@Component({
  selector: 'app-booking-guests-section',
  imports: [MatButtonModule, MatIconModule, BookingGuestSummary],
  templateUrl: './booking-guests-section.html',
  styleUrl: './booking-guests-section.scss',
})
export class BookingGuestsSection {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogService = inject(Dialog);

  readonly primaryGuest = model<BookingGuestInput | null>(null);
  readonly secondaryGuests = model<BookingGuestInput[]>([]);
  /** Guests the chosen room fits; null until a room is chosen. */
  readonly capacity = input<number | null>(null);
  /** Room number, used in the capacity message. */
  readonly roomNumber = input<string | null>(null);
  /** Shows the "Add the primary guest" error after a save attempt. */
  readonly showErrors = input(false);

  protected readonly guestCount = computed(
    () => (this.primaryGuest() ? 1 : 0) + this.secondaryGuests().length,
  );
  /** Secondary guests the room fits besides the primary guest. */
  protected readonly secondaryLimit = computed(() => Math.max((this.capacity() ?? 1) - 1, 0));
  protected readonly isFull = computed(() => {
    const capacity = this.capacity();
    return capacity !== null && this.guestCount() >= capacity;
  });
  protected readonly extraGuests = computed(() => {
    const capacity = this.capacity();
    return capacity === null ? 0 : Math.max(this.guestCount() - capacity, 0);
  });
  protected readonly canAddSecondary = computed(() => this.capacity() !== null && !this.isFull());

  protected addOrEditPrimary(): void {
    this.openGuestDialog({ guest: this.primaryGuest() ?? undefined, isPrimary: true }, (guest) =>
      this.primaryGuest.set(guest),
    );
  }

  protected addSecondary(): void {
    if (!this.canAddSecondary()) {
      return;
    }
    this.openGuestDialog({ isPrimary: false }, (guest) =>
      this.secondaryGuests.update((guests) => [...guests, guest]),
    );
  }

  protected editSecondary(index: number): void {
    this.openGuestDialog({ guest: this.secondaryGuests()[index], isPrimary: false }, (guest) =>
      this.secondaryGuests.update((guests) =>
        guests.map((item, i) => (i === index ? guest : item)),
      ),
    );
  }

  protected removeSecondary(index: number): void {
    const guest = this.secondaryGuests()[index];
    this.dialogService
      .openConfirmDialog(
        $localize`Remove guest`,
        $localize`Remove ${guest.firstName} ${guest.lastName} from this booking?`,
      )
      .afterClosed()
      .pipe(filter((confirmed): confirmed is true => confirmed === true))
      .subscribe(() =>
        this.secondaryGuests.update((guests) => guests.filter((_, i) => i !== index)),
      );
  }

  /** Accessible name of a guest's edit button, e.g. "Edit Asha Rao". */
  protected editGuestLabel(guest: BookingGuestInput): string {
    return $localize`Edit ${guest.firstName} ${guest.lastName}`;
  }

  /** Accessible name of a guest's remove button, e.g. "Remove Ravi Rao". */
  protected removeGuestLabel(guest: BookingGuestInput): string {
    return $localize`Remove ${guest.firstName} ${guest.lastName}`;
  }

  private openGuestDialog(
    data: GuestDetailsDialogData,
    onSave: (guest: BookingGuestInput) => void,
  ): void {
    this.matDialog
      .open<GuestDetailsDialog, GuestDetailsDialogData, BookingGuestInput | null>(
        GuestDetailsDialog,
        {
          data,
          width: '640px',
          maxWidth: '95vw',
          panelClass: 'full-screen-dialog-mobile',
        },
      )
      .afterClosed()
      .pipe(filter((guest): guest is BookingGuestInput => !!guest))
      .subscribe(onSave);
  }
}
