import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, filter, finalize, map, merge, Observable } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { nameFloor } from '../../../pipes/floor-label/floor-label-pipe';
import { Booking } from '../../../services/booking/booking';
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import { BookingStatus } from '../../../types/enums/booking';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import {
  AvailableRoom,
  BookingDetail,
  BookingGuestInput,
  BookingStayRequest,
} from '../../../types/interfaces/booking';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { OrganizationReference } from '../../../types/interfaces/room-amenity';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import {
  addDaysToIsoDate,
  nightsBetween,
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
} from '../../../utils/iso-date';
import { Banner } from '../../common/banner/banner';
import { PageHeader } from '../../common/page-header/page-header';
import { OrganizationSelectionField } from '../../organization/organization-selection-field/organization-selection-field';
import { BookingGuestsSection } from '../booking-guests-section/booking-guests-section';

/** Limits shared with the backend (booking service `Booking` model and rules). */
const MAX_NIGHTS = 90;
const MAX_DAYS_AHEAD = 730;
const NOTES_MAX_LENGTH = 1000;

type StayForm = FormGroup<{
  organization: FormControl<OrganizationReference | null>;
  checkInDate: FormControl<Date | null>;
  checkOutDate: FormControl<Date | null>;
  roomGuid: FormControl<string | null>;
  notes: FormControl<string>;
  recordAsCompletedStay: FormControl<boolean>;
}>;

/** Checks the stay length: at least one night and at most 90. */
function stayLengthValidator(group: AbstractControl): ValidationErrors | null {
  const { checkInDate, checkOutDate } = (group as StayForm).controls;
  if (!checkInDate.value || !checkOutDate.value) {
    return null;
  }
  const nights = nightsBetween(toIsoDate(checkInDate.value), toIsoDate(checkOutDate.value));
  if (nights < 1) {
    return { checkOutBeforeCheckIn: true };
  }
  return nights > MAX_NIGHTS ? { stayTooLong: true } : null;
}

/** Room choice as shown in the room select, e.g. "201 · Floor 2 · Deluxe double · 2 guests". */
export function formatRoomOption(room: AvailableRoom): string {
  return $localize`${room.roomNumber} · ${nameFloor(room.floor)} · ${room.roomType.name} · ${room.roomType.capacity} guests`;
}

/**
 * Page to create a booking, or edit one when the route has a `guid` query
 * parameter.
 *
 * Admins choose the organization first; owners and managers book in their
 * active organization. Choosing the dates lists the rooms free for them;
 * the room's capacity limits the guests. Confirmed bookings can change
 * everything; checked-in bookings keep their room and check-in date;
 * finished bookings can't be edited.
 */
@Component({
  selector: 'app-create-booking',
  imports: [
    PageHeader,
    Banner,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    OrganizationSelectionField,
    BookingGuestsSection,
  ],
  templateUrl: './create-booking.html',
  styleUrl: './create-booking.scss',
})
export class CreateBooking implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);
  private readonly profileService = inject(Profile);
  private readonly bookingService = inject(Booking);

  private readonly banner = viewChild<Banner>('formBanner');

  protected readonly notesMaxLength = NOTES_MAX_LENGTH;
  protected readonly bookingListingRoute = appRoutes.bookingListing;
  protected readonly roomListingRoute = appRoutes.roomListing;
  protected readonly maxCheckInDate = parseIsoDate(
    addDaysToIsoDate(todayIsoDate(), MAX_DAYS_AHEAD),
  );

  /** GUID of the booking to edit, from the `guid` query parameter; null when creating. */
  protected readonly bookingGuid = this.route.snapshot.queryParamMap.get('guid');
  protected readonly isEditMode = !!this.bookingGuid;
  protected readonly titleText = this.isEditMode
    ? $localize`Edit Booking`
    : $localize`Create Booking`;
  protected readonly submitLabel = this.isEditMode ? $localize`Save` : $localize`Create booking`;

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );

  protected readonly isLoadingBooking = signal(false);
  protected readonly bookingNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitAttempted = signal(false);
  /** The booking being edited. */
  protected readonly booking = signal<BookingDetail | null>(null);
  /** Checked-in bookings keep their room and check-in date. */
  protected readonly isCheckedIn = computed(
    () => this.booking()?.status === BookingStatus.CHECKED_IN,
  );
  /** Checked-out and cancelled bookings are read-only. */
  protected readonly isReadOnly = computed(() => {
    const status = this.booking()?.status;
    return status === BookingStatus.CHECKED_OUT || status === BookingStatus.CANCELLED;
  });

  protected readonly organization = signal<OrganizationReference | null>(null);
  protected readonly availableRooms = signal<AvailableRoom[]>([]);
  protected readonly isLoadingRooms = signal(false);
  /** Room that is no longer free for the new dates, shown under the room field. */
  protected readonly clearedRoomNumber = signal<string | null>(null);

  protected readonly primaryGuest = signal<BookingGuestInput | null>(null);
  protected readonly secondaryGuests = signal<BookingGuestInput[]>([]);

  protected bannerMessage = '';

  protected readonly stayForm: StayForm = new FormGroup(
    {
      organization: new FormControl<OrganizationReference | null>(null),
      checkInDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
      checkOutDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
      roomGuid: new FormControl<string | null>(null, { validators: [Validators.required] }),
      notes: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(NOTES_MAX_LENGTH)],
      }),
      recordAsCompletedStay: new FormControl(false, { nonNullable: true }),
    },
    { validators: [stayLengthValidator] },
  );

  private readonly formValue = toSignal(
    this.stayForm.valueChanges.pipe(map(() => this.stayForm.getRawValue())),
    { initialValue: this.stayForm.getRawValue() },
  );

  /** Stay dates as ISO dates, when both are set and form a valid stay. */
  protected readonly stayDates = computed(() => {
    const { checkInDate, checkOutDate } = this.formValue();
    if (!checkInDate || !checkOutDate) {
      return null;
    }
    const checkIn = toIsoDate(checkInDate);
    const checkOut = toIsoDate(checkOutDate);
    const nights = nightsBetween(checkIn, checkOut);
    return nights >= 1 && nights <= MAX_NIGHTS ? { checkIn, checkOut, nights } : null;
  });
  /** Admins must pick an organization before dates and rooms. */
  protected readonly canChooseStay = computed(
    () => !this.isAdmin() || this.organization() !== null,
  );
  protected readonly selectedRoom = computed(
    () => this.availableRooms().find((room) => room.guid === this.formValue().roomGuid) ?? null,
  );
  protected readonly isBackDated = computed(() => {
    const dates = this.stayDates();
    return !!dates && dates.checkIn < todayIsoDate();
  });
  /** A stay that has ended can be saved directly as checked out (new bookings only). */
  protected readonly canRecordCompletedStay = computed(() => {
    const dates = this.stayDates();
    return !this.isEditMode && !!dates && dates.checkOut <= todayIsoDate();
  });
  /** Nights × nightly rate = total, for the read-only price line. */
  protected readonly price = computed(() => {
    const dates = this.stayDates();
    const room = this.selectedRoom();
    if (!dates || !room) {
      return null;
    }
    // A checked-in stay keeps its agreed rate; otherwise the room type's current rate applies.
    const booking = this.booking();
    const costPerNight = Number(
      this.isCheckedIn() && booking ? booking.costPerNight : room.roomType.costPerNight,
    );
    return {
      nights: dates.nights,
      costPerNight,
      total: costPerNight * dates.nights,
      currencyCode: room.currency.currencyCode,
    };
  });
  protected readonly guestCount = computed(
    () => (this.primaryGuest() ? 1 : 0) + this.secondaryGuests().length,
  );
  protected readonly isOverCapacity = computed(() => {
    const room = this.selectedRoom();
    return !!room && this.guestCount() > room.roomType.capacity;
  });

  protected readonly formatRoomOption = formatRoomOption;

  constructor() {
    // Dates wait for an admin's organization; the room waits for valid dates.
    effect(() => {
      const canChooseStay = this.canChooseStay();
      const hasStayDates = this.stayDates() !== null;
      untracked(() => this.syncFieldAvailability(canChooseStay, hasStayDates));
    });
  }

  ngOnInit(): void {
    if (this.isAdmin() && !this.isEditMode) {
      this.stayForm.controls.organization.setValidators(Validators.required);
      this.watchOrganization();
    }
    this.watchStayDates();
    this.watchRoomChoice();
    if (this.bookingGuid) {
      this.loadBooking(this.bookingGuid);
    }
  }

  protected onSubmit(): void {
    this.submitAttempted.set(true);
    if (this.stayForm.invalid || !this.primaryGuest() || this.isOverCapacity()) {
      this.stayForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.dialogService
        .openConfirmDialog(
          $localize`Confirm Changes`,
          $localize`Are you sure you want to save these changes?`,
        )
        .afterClosed()
        .pipe(filter((confirmed): confirmed is true => confirmed === true))
        .subscribe(() => this.updateBooking());
      return;
    }
    this.createBooking();
  }

  /**
   * Enables the fields the user can fill in now. A checked-in booking keeps
   * its room and check-in date; a finished booking is read-only.
   */
  private syncFieldAvailability(canChooseStay: boolean, hasStayDates: boolean): void {
    if (this.isReadOnly()) {
      return;
    }
    const { checkInDate, checkOutDate, roomGuid } = this.stayForm.controls;
    const setEnabled = (control: AbstractControl, enabled: boolean): void => {
      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    };
    setEnabled(checkInDate, canChooseStay && !this.isCheckedIn());
    setEnabled(checkOutDate, canChooseStay);
    setEnabled(roomGuid, canChooseStay && hasStayDates && !this.isCheckedIn());
  }

  /** Admins: a new organization clears the room (rooms belong to one organization). */
  private watchOrganization(): void {
    this.stayForm.controls.organization.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((organization) => {
        if (organization?.guid === this.organization()?.guid) {
          return;
        }
        this.organization.set(organization);
        this.stayForm.controls.roomGuid.setValue(null);
        this.availableRooms.set([]);
        this.loadAvailableRooms();
      });
  }

  /** Reloads the free rooms whenever the stay dates change. */
  private watchStayDates(): void {
    const { checkInDate, checkOutDate } = this.stayForm.controls;
    merge(checkInDate.valueChanges, checkOutDate.valueChanges)
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.canRecordCompletedStay()) {
          this.stayForm.controls.recordAsCompletedStay.setValue(false);
        }
        this.loadAvailableRooms();
      });
  }

  /** Choosing a room clears the "no longer free" message. */
  private watchRoomChoice(): void {
    this.stayForm.controls.roomGuid.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roomGuid) => {
        if (roomGuid) {
          this.clearedRoomNumber.set(null);
        }
      });
  }

  /**
   * Lists the rooms free for the chosen dates. A chosen room that is no
   * longer free is cleared with a message; editing keeps the booking's own
   * room on offer.
   */
  private loadAvailableRooms(): void {
    const dates = this.stayDates();
    if (!dates || !this.canChooseStay()) {
      this.availableRooms.set(this.currentRoomOnly());
      return;
    }
    this.isLoadingRooms.set(true);
    this.bookingService
      .listAvailableRooms({
        organizationGuid: this.isAdmin() ? (this.organization()?.guid ?? null) : null,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut,
        excludeBookingGuid: this.bookingGuid,
      })
      .pipe(finalize(() => this.isLoadingRooms.set(false)))
      .subscribe((rooms) => {
        const currentRoom = this.currentRoomOnly()[0];
        // A checked-in booking keeps its room even if the room is not bookable any more.
        const offered =
          currentRoom && this.isCheckedIn() && !rooms.some((room) => room.guid === currentRoom.guid)
            ? [currentRoom, ...rooms]
            : rooms;
        const roomControl = this.stayForm.controls.roomGuid;
        const chosen = roomControl.value;
        if (chosen && !offered.some((room) => room.guid === chosen)) {
          const previous = this.availableRooms().find((room) => room.guid === chosen);
          this.clearedRoomNumber.set(previous?.roomNumber ?? null);
          roomControl.setValue(null);
          roomControl.markAsTouched();
        }
        this.availableRooms.set(offered);
      });
  }

  /** The edited booking's own room as a room option, priced at its agreed rate. */
  private currentRoomOnly(): AvailableRoom[] {
    const booking = this.booking();
    if (!booking) {
      return [];
    }
    return [
      {
        guid: booking.room.guid,
        roomNumber: booking.room.roomNumber,
        floor: booking.room.floor,
        roomType: { ...booking.room.roomType, costPerNight: booking.costPerNight },
        currency: booking.currency,
      },
    ];
  }

  private loadBooking(guid: string): void {
    this.isLoadingBooking.set(true);
    this.bookingService
      .getBooking(guid)
      .pipe(finalize(() => this.isLoadingBooking.set(false)))
      .subscribe({
        next: (booking) => this.fillFormFromBooking(booking),
        error: (error: HttpErrorResponse) => {
          if (this.isBookingNotFoundError(error)) {
            this.bookingNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private fillFormFromBooking(booking: BookingDetail): void {
    this.booking.set(booking);
    this.organization.set(booking.organization);
    this.availableRooms.set(this.currentRoomOnly());
    this.stayForm.patchValue(
      {
        organization: booking.organization,
        checkInDate: parseIsoDate(booking.checkInDate),
        checkOutDate: parseIsoDate(booking.checkOutDate),
        roomGuid: booking.room.guid,
        notes: booking.notes ?? '',
      },
      { emitEvent: false },
    );
    this.stayForm.updateValueAndValidity();
    this.primaryGuest.set(booking.primaryGuest);
    this.secondaryGuests.set(booking.secondaryGuests);
    // A checked-in booking keeps its room and check-in date (see syncFieldAvailability).
    this.syncFieldAvailability(this.canChooseStay(), this.stayDates() !== null);
    if (this.isReadOnly()) {
      this.stayForm.disable({ emitEvent: false });
      return;
    }
    this.loadAvailableRooms();
  }

  private createBooking(): void {
    const value = this.stayForm.getRawValue();
    this.submitBooking(
      this.bookingService.create({
        organizationGuid: this.isAdmin() ? (value.organization?.guid ?? null) : null,
        recordAsCompletedStay: this.canRecordCompletedStay() && value.recordAsCompletedStay,
        ...this.buildStayRequest(),
      }),
      (booking) => $localize`Booking ${booking.reference} created.`,
    );
  }

  private updateBooking(): void {
    if (!this.bookingGuid) {
      return;
    }
    this.submitBooking(
      this.bookingService.update({ guid: this.bookingGuid, ...this.buildStayRequest() }),
      (booking) => $localize`Booking ${booking.reference} updated.`,
    );
  }

  /** Runs a create or update request, then opens the booking's details on success. */
  private submitBooking(
    saveRequest: Observable<BookingDetail>,
    successMessage: (booking: BookingDetail) => string,
  ): void {
    this.isSubmitting.set(true);
    saveRequest.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: (booking) => {
        this.showSnackbar(successMessage(booking), GenericSnackbarType.SUCCESS);
        void this.router.navigate([appRoutes.bookingDetails], {
          queryParams: { guid: booking.guid },
        });
      },
      error: (error: HttpErrorResponse) => this.handleSubmitError(error),
    });
  }

  /** Form values sent on both create and update. */
  private buildStayRequest(): BookingStayRequest {
    const value = this.stayForm.getRawValue();
    return {
      roomGuid: value.roomGuid ?? '',
      checkInDate: toIsoDate(value.checkInDate as Date),
      checkOutDate: toIsoDate(value.checkOutDate as Date),
      notes: value.notes.trim() || null,
      primaryGuest: this.primaryGuest() as BookingGuestInput,
      secondaryGuests: this.secondaryGuests(),
    };
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorResponse = error.error as ApiErrorResponse<unknown> | null;

    switch (errorResponse?.errorCode) {
      case ErrorCodes.BOOKING_ROOM_UNAVAILABLE:
        this.showErrorBanner(errorResponse.message);
        this.loadAvailableRooms();
        return;
      case ErrorCodes.BOOKING_GUEST_CAPACITY_EXCEEDED:
      case ErrorCodes.BOOKING_PRIMARY_GUEST_REQUIRED:
      case ErrorCodes.BOOKING_INVALID_DATES:
      case ErrorCodes.BOOKING_NOT_EDITABLE:
        this.showErrorBanner(errorResponse.message);
        return;
      case ErrorCodes.ORGANIZATION_NOT_FOUND:
      case ErrorCodes.BOOKING_ORGANIZATION_REQUIRED:
        this.showErrorBanner($localize`Please choose an available organization.`);
        return;
      case ErrorCodes.BOOKING_NOT_FOUND:
        this.bookingNotFound.set(true);
        return;
    }

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showErrorBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    throw error;
  }

  private isBookingNotFoundError(error: HttpErrorResponse): boolean {
    return (
      error.status === HttpStatusCode.NotFound ||
      (error.error as ApiErrorResponse<unknown> | null)?.errorCode === ErrorCodes.BOOKING_NOT_FOUND
    );
  }

  private showErrorBanner(message: string): void {
    const banner = this.banner();
    if (!banner) {
      return;
    }
    this.bannerMessage = message;
    banner.type = BANNER_TYPES.ERROR;
    banner.show();
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
