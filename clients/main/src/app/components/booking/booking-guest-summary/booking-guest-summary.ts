import { Component, computed, input } from '@angular/core';
import { getGenderLabel, getIdProofTypeLabel } from '../../../data/booking-options';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { ageOn, todayIsoDate } from '../../../utils/iso-date';

/**
 * One guest of a booking as a compact card: name, gender, age, contact and
 * ID proof (shown as given: masked in listings, full in the details).
 * Row actions (e.g. Edit, Remove) are projected with `[guestActions]`.
 */
@Component({
  selector: 'app-booking-guest-summary',
  templateUrl: './booking-guest-summary.html',
  styleUrl: './booking-guest-summary.scss',
})
export class BookingGuestSummary {
  readonly guest = input.required<BookingGuestInput>();
  readonly isPrimary = input(false);

  protected readonly fullName = computed(
    () => `${this.guest().firstName} ${this.guest().lastName}`,
  );
  /** Gender, age, phone and email, in that order, without the missing ones. */
  protected readonly details = computed(() => {
    const guest = this.guest();
    return [
      getGenderLabel(guest.gender),
      $localize`${ageOn(guest.dateOfBirth, todayIsoDate())} years`,
      guest.phone,
      guest.email,
    ].filter((detail): detail is string => !!detail);
  });
  protected readonly idProof = computed(() => {
    const { idProofType, idProofNumber } = this.guest();
    return idProofType && idProofNumber
      ? `${getIdProofTypeLabel(idProofType)} ${idProofNumber}`
      : null;
  });
  protected readonly origin = computed(() =>
    [this.guest().nationality, this.guest().address]
      .filter((part): part is string => !!part)
      .join(' · '),
  );
}
