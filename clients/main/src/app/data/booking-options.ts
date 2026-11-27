import { BookingStatus, Gender, IdProofType } from '../types/enums/booking';

/** How a booking status is labeled and drawn. */
export interface BookingStatusOption {
  value: BookingStatus;
  label: string;
  /** Global status chip modifier (see styles/_utils.scss). */
  chipClass: string;
}

/** Booking statuses in lifecycle order (listing filter and chips). */
export const bookingStatusOptions: readonly BookingStatusOption[] = [
  {
    value: BookingStatus.CONFIRMED,
    label: $localize`Confirmed`,
    chipClass: 'status-chip--primary',
  },
  {
    value: BookingStatus.CHECKED_IN,
    label: $localize`Checked in`,
    chipClass: 'status-chip--active',
  },
  {
    value: BookingStatus.CHECKED_OUT,
    label: $localize`Checked out`,
    chipClass: 'status-chip--secondary',
  },
  {
    value: BookingStatus.CANCELLED,
    label: $localize`Cancelled`,
    chipClass: 'status-chip--inactive',
  },
];

/** Looks up the label and chip class of a booking status. */
export function getBookingStatusOption(status: BookingStatus): BookingStatusOption {
  return bookingStatusOptions.find((option) => option.value === status) ?? bookingStatusOptions[0];
}

export interface LabeledOption<T> {
  value: T;
  label: string;
}

/** Genders offered in the guest form. */
export const genderOptions: readonly LabeledOption<Gender>[] = [
  { value: Gender.FEMALE, label: $localize`Female` },
  { value: Gender.MALE, label: $localize`Male` },
  { value: Gender.OTHER, label: $localize`Other` },
  { value: Gender.PREFER_NOT_TO_SAY, label: $localize`Prefer not to say` },
];

/** Identity documents offered in the guest form. */
export const idProofTypeOptions: readonly LabeledOption<IdProofType>[] = [
  { value: IdProofType.AADHAAR, label: $localize`Aadhaar` },
  { value: IdProofType.PASSPORT, label: $localize`Passport` },
  { value: IdProofType.DRIVING_LICENCE, label: $localize`Driving licence` },
  { value: IdProofType.VOTER_ID, label: $localize`Voter ID` },
  { value: IdProofType.OTHER, label: $localize`Other` },
];

/** Label of a gender, e.g. "Female". */
export function getGenderLabel(gender: Gender): string {
  return genderOptions.find((option) => option.value === gender)?.label ?? gender;
}

/** Label of an identity document type, e.g. "Passport". */
export function getIdProofTypeLabel(idProofType: IdProofType): string {
  return idProofTypeOptions.find((option) => option.value === idProofType)?.label ?? idProofType;
}
