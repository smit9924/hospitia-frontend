/** Lifecycle status of a booking (booking service `BookingStatus`). */
export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

/** Actions a booking's status and dates allow (booking service `BookingAction`). */
export enum BookingAction {
  EDIT = 'edit',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  CANCEL = 'cancel',
}

/** Gender of a booking guest (booking service `Gender`). */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/** Kind of identity document recorded for a guest (booking service `IdProofType`). */
export enum IdProofType {
  AADHAAR = 'aadhaar',
  PASSPORT = 'passport',
  DRIVING_LICENCE = 'driving_licence',
  VOTER_ID = 'voter_id',
  OTHER = 'other',
}
