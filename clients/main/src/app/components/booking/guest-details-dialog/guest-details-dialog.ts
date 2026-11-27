import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { genderOptions, idProofTypeOptions } from '../../../data/booking-options';
import { Gender, IdProofType } from '../../../types/enums/booking';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { parseIsoDate, toIsoDate } from '../../../utils/iso-date';

/** Limits shared with the backend (booking service `GuestDetail` model). */
const NAME_MAX_LENGTH = 100;
const PHONE_MIN_LENGTH = 7;
const PHONE_MAX_LENGTH = 20;
/** Digits, spaces, "+", "-", "(" and ")" (e.g. "+91 98450 12345"). */
const PHONE_PATTERN = /^[0-9+()\- ]+$/;
const EMAIL_MAX_LENGTH = 255;
const ID_PROOF_NUMBER_MAX_LENGTH = 50;
/** Letters, digits, spaces, "-" and "/" (e.g. "1234 5678 9012"). */
const ID_PROOF_NUMBER_PATTERN = /^[A-Za-z0-9 /-]+$/;
const ADDRESS_MAX_LENGTH = 500;
const NATIONALITY_MAX_LENGTH = 100;
const MAX_AGE_YEARS = 120;

/** Data passed to the guest dialog. */
export interface GuestDetailsDialogData {
  /** The guest to edit; absent when adding a guest. */
  guest?: BookingGuestInput;
  /** The primary guest also needs a phone number and an ID proof. */
  isPrimary: boolean;
}

type GuestForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  gender: FormControl<Gender | null>;
  dateOfBirth: FormControl<Date | null>;
  phone: FormControl<string>;
  email: FormControl<string>;
  idProofType: FormControl<IdProofType | null>;
  idProofNumber: FormControl<string>;
  address: FormControl<string>;
  nationality: FormControl<string>;
}>;

/** Requires the ID proof type and number together (or neither). */
function idProofPairValidator(group: AbstractControl): ValidationErrors | null {
  const form = group as GuestForm;
  const hasType = form.controls.idProofType.value !== null;
  const hasNumber = form.controls.idProofNumber.value.trim() !== '';
  return hasType === hasNumber ? null : { idProofPair: true };
}

/** Trimmed text, or null when blank. */
function optionalText(value: string): string | null {
  return value.trim() || null;
}

/**
 * Popup form for one booking guest. Closes with the guest's details when
 * the user adds or saves, or with null when dismissed. The booking form
 * shows the result in its guest list; nothing is saved until the booking is.
 */
@Component({
  selector: 'app-guest-details-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './guest-details-dialog.html',
  styleUrl: './guest-details-dialog.scss',
})
export class GuestDetailsDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<GuestDetailsDialog, BookingGuestInput | null>);
  private readonly data = inject<GuestDetailsDialogData>(MAT_DIALOG_DATA);

  protected readonly isPrimary = this.data.isPrimary;
  protected readonly isEditing = !!this.data.guest;
  protected readonly titleText = this.isPrimary
    ? $localize`Primary guest`
    : this.isEditing
      ? $localize`Edit guest`
      : $localize`Add guest`;
  protected readonly submitLabel = this.isEditing ? $localize`Save` : $localize`Add`;

  protected readonly genderOptions = genderOptions;
  protected readonly idProofTypeOptions = idProofTypeOptions;
  protected readonly nameMaxLength = NAME_MAX_LENGTH;
  protected readonly phoneMaxLength = PHONE_MAX_LENGTH;
  protected readonly idProofNumberMaxLength = ID_PROOF_NUMBER_MAX_LENGTH;
  protected readonly addressMaxLength = ADDRESS_MAX_LENGTH;
  protected readonly nationalityMaxLength = NATIONALITY_MAX_LENGTH;

  /** Birth dates offered by the date picker: at most 120 years ago, not in the future. */
  protected readonly maxBirthDate = new Date();
  protected readonly minBirthDate = new Date(
    this.maxBirthDate.getFullYear() - MAX_AGE_YEARS,
    this.maxBirthDate.getMonth(),
    this.maxBirthDate.getDate(),
  );

  protected readonly guestForm: GuestForm = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(NAME_MAX_LENGTH),
        ],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.maxLength(NAME_MAX_LENGTH),
        ],
      }),
      gender: new FormControl<Gender | null>(null, { validators: [Validators.required] }),
      dateOfBirth: new FormControl<Date | null>(null, { validators: [Validators.required] }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.minLength(PHONE_MIN_LENGTH),
          Validators.maxLength(PHONE_MAX_LENGTH),
          Validators.pattern(PHONE_PATTERN),
        ],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.email, Validators.maxLength(EMAIL_MAX_LENGTH)],
      }),
      idProofType: new FormControl<IdProofType | null>(null),
      idProofNumber: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.maxLength(ID_PROOF_NUMBER_MAX_LENGTH),
          Validators.pattern(ID_PROOF_NUMBER_PATTERN),
        ],
      }),
      address: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(ADDRESS_MAX_LENGTH)],
      }),
      nationality: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(NATIONALITY_MAX_LENGTH)],
      }),
    },
    { validators: [idProofPairValidator] },
  );

  ngOnInit(): void {
    if (this.isPrimary) {
      // The primary guest is the contact person: phone and ID proof are required.
      const { phone, idProofType, idProofNumber } = this.guestForm.controls;
      phone.addValidators(Validators.required);
      idProofType.addValidators(Validators.required);
      idProofNumber.addValidators(Validators.required);
    }
    const guest = this.data.guest;
    if (guest) {
      this.guestForm.setValue({
        firstName: guest.firstName,
        lastName: guest.lastName,
        gender: guest.gender,
        dateOfBirth: parseIsoDate(guest.dateOfBirth),
        phone: guest.phone ?? '',
        email: guest.email ?? '',
        idProofType: guest.idProofType,
        idProofNumber: guest.idProofNumber ?? '',
        address: guest.address ?? '',
        nationality: guest.nationality ?? '',
      });
    }
    this.guestForm.updateValueAndValidity();
  }

  /** Whether the "type and number together" rule failed (shown under the ID number). */
  protected hasIdProofPairError(): boolean {
    const { idProofNumber, idProofType } = this.guestForm.controls;
    return this.guestForm.hasError('idProofPair') && (idProofNumber.touched || idProofType.touched);
  }

  protected submit(): void {
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      return;
    }
    const value = this.guestForm.getRawValue();
    this.dialogRef.close({
      ...(this.data.guest?.guid ? { guid: this.data.guest.guid } : {}),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      gender: value.gender as Gender,
      dateOfBirth: toIsoDate(value.dateOfBirth as Date),
      phone: optionalText(value.phone),
      email: optionalText(value.email),
      idProofType: value.idProofType,
      idProofNumber: optionalText(value.idProofNumber),
      address: optionalText(value.address),
      nationality: optionalText(value.nationality),
    });
  }

  protected close(): void {
    this.dialogRef.close(null);
  }
}
