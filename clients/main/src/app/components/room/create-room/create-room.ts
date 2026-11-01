import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, finalize, Observable } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { roomStatusOptions } from '../../../data/room-status-options';
import { FloorLabelPipe } from '../../../pipes/floor-label/floor-label-pipe';
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { Room } from '../../../services/room/room';
import { RoomType } from '../../../services/room-type/room-type';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { RoomStatus } from '../../../types/enums/room';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { RoomAttributes, RoomListItem } from '../../../types/interfaces/room';
import { OrganizationReference } from '../../../types/interfaces/room-amenity';
import { RoomTypeOption } from '../../../types/interfaces/room-type';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Banner } from '../../common/banner/banner';
import { PageHeader } from '../../common/page-header/page-header';
import { OrganizationSelectionField } from '../../organization/organization-selection-field/organization-selection-field';

/** Limits shared with the backend (booking service `Room` model). */
const ROOM_NUMBER_MAX_LENGTH = 20;
/** Letters, digits, "-" and "/" only, e.g. "101", "A-12", "B2/04". */
const ROOM_NUMBER_PATTERN = /^[A-Za-z0-9/-]+$/;
const MIN_FLOOR = -500;
const MAX_FLOOR = 500;
const NOTES_MAX_LENGTH = 500;

/** Rejects floors with a fractional part (a floor is a whole number). */
function wholeNumberValidator(control: AbstractControl<number | null>): ValidationErrors | null {
  const value = control.value;
  return value === null || Number.isInteger(value) ? null : { wholeNumber: true };
}

/**
 * Validates the characters of the trimmed room number, so surrounding spaces
 * (trimmed on save) are not reported as invalid.
 */
function roomNumberCharactersValidator(control: AbstractControl<string>): ValidationErrors | null {
  const roomNumber = control.value.trim();
  return roomNumber === '' || ROOM_NUMBER_PATTERN.test(roomNumber)
    ? null
    : { roomNumberCharacters: true };
}

type RoomForm = FormGroup<{
  organization: FormControl<OrganizationReference | null>;
  roomNumber: FormControl<string>;
  floor: FormControl<number | null>;
  roomTypeGuid: FormControl<string | null>;
  status: FormControl<RoomStatus>;
  notes: FormControl<string>;
}>;

/**
 * Page to create a room, or edit one when the route has a `guid` query
 * parameter.
 *
 * Owners and managers create rooms in their active organization. Admins
 * choose the organization first; the room type list then shows that
 * organization's room types. The organization cannot change afterwards.
 */
@Component({
  selector: 'app-create-room',
  imports: [
    PageHeader,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterLink,
    Banner,
    OrganizationSelectionField,
    DecimalPipe,
    FloorLabelPipe,
  ],
  templateUrl: './create-room.html',
  styleUrl: './create-room.scss',
})
export class CreateRoom implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);
  private readonly profileService = inject(Profile);
  private readonly roomService = inject(Room);
  private readonly roomTypeService = inject(RoomType);

  private readonly banner = viewChild<Banner>('formBanner');

  protected readonly roomNumberMaxLength = ROOM_NUMBER_MAX_LENGTH;
  protected readonly notesMaxLength = NOTES_MAX_LENGTH;
  protected readonly minFloor = MIN_FLOOR;
  protected readonly maxFloor = MAX_FLOOR;
  protected readonly statusOptions = roomStatusOptions;
  protected readonly roomTypeListingRoute = appRoutes.roomTypeListing;

  /** GUID of the room to edit, from the `guid` query parameter; null when creating. */
  protected readonly roomGuid = this.route.snapshot.queryParamMap.get('guid');
  protected readonly isEditMode = !!this.roomGuid;
  protected readonly titleText = this.isEditMode ? $localize`Edit Room` : $localize`Create Room`;
  protected readonly submitLabel = this.isEditMode ? $localize`Save` : $localize`Create`;

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );

  protected readonly isLoadingRoom = signal(false);
  protected readonly roomNotFound = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly roomTypeOptions = signal<RoomTypeOption[]>([]);
  protected readonly isLoadingRoomTypes = signal(false);
  /** Organization of the room: chosen by an admin, fixed when editing. */
  protected readonly roomOrganization = signal<OrganizationReference | null>(null);
  /** Admins must pick an organization before its room types can be listed. */
  protected readonly canChooseRoomType = computed(
    () => !this.isAdmin() || this.roomOrganization() !== null,
  );
  /** True once room types were loaded and the organization has none. */
  protected readonly hasNoRoomTypes = computed(
    () =>
      this.canChooseRoomType() && !this.isLoadingRoomTypes() && this.roomTypeOptions().length === 0,
  );

  protected bannerMessage = '';

  protected readonly roomForm: RoomForm = new FormGroup({
    organization: new FormControl<OrganizationReference | null>(null),
    roomNumber: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(ROOM_NUMBER_MAX_LENGTH),
        roomNumberCharactersValidator,
      ],
    }),
    floor: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(MIN_FLOOR),
        Validators.max(MAX_FLOOR),
        wholeNumberValidator,
      ],
    }),
    roomTypeGuid: new FormControl<string | null>(null, { validators: [Validators.required] }),
    status: new FormControl<RoomStatus>(RoomStatus.AVAILABLE, { nonNullable: true }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(NOTES_MAX_LENGTH)],
    }),
  });

  /** Current floor value, for the "Shown as …" preview under the field. */
  protected readonly floorValue = toSignal(this.roomForm.controls.floor.valueChanges, {
    initialValue: null,
  });
  /** Whether the floor is a valid whole number in range, so the preview can show its label. */
  protected readonly hasValidFloor = computed(() => {
    const floor = this.floorValue();
    return floor !== null && Number.isInteger(floor) && floor >= MIN_FLOOR && floor <= MAX_FLOOR;
  });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.roomForm.controls.organization.setValidators(Validators.required);
      this.watchAdminOrganizationSelection();
    }

    if (this.roomGuid) {
      this.loadRoom(this.roomGuid);
    } else if (!this.isAdmin()) {
      this.loadRoomTypeOptions(null);
    }
  }

  protected onSubmit(): void {
    if (!this.roomForm.valid) {
      this.roomForm.markAllAsTouched();
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
        .subscribe(() => this.updateRoom());
      return;
    }

    this.createRoom();
  }

  /** Reloads the room types when an admin picks another organization. */
  private watchAdminOrganizationSelection(): void {
    this.roomForm.controls.organization.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((organization) => {
        if (organization?.guid === this.roomOrganization()?.guid) {
          return;
        }
        this.roomOrganization.set(organization);
        // Room types belong to one organization; a previous choice no longer applies.
        this.roomForm.controls.roomTypeGuid.setValue(null);
        if (organization) {
          this.loadRoomTypeOptions(organization.guid);
        } else {
          this.roomTypeOptions.set([]);
        }
      });
  }

  /**
   * Loads the organization's room types and clears the chosen one when it
   * is no longer offered (e.g. it was deleted meanwhile).
   */
  private loadRoomTypeOptions(organizationGuid: string | null): void {
    this.isLoadingRoomTypes.set(true);
    this.roomTypeService
      .listOptions(organizationGuid)
      .pipe(finalize(() => this.isLoadingRoomTypes.set(false)))
      .subscribe((roomTypes) => {
        this.roomTypeOptions.set(roomTypes);
        const roomTypeControl = this.roomForm.controls.roomTypeGuid;
        if (!roomTypes.some((roomType) => roomType.guid === roomTypeControl.value)) {
          roomTypeControl.setValue(null);
        }
      });
  }

  private loadRoom(guid: string): void {
    this.isLoadingRoom.set(true);
    this.roomService
      .getRoom(guid)
      .pipe(finalize(() => this.isLoadingRoom.set(false)))
      .subscribe({
        next: (room) => this.fillFormFromRoom(room),
        error: (error: HttpErrorResponse) => {
          if (this.isRoomNotFoundError(error)) {
            this.roomNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private fillFormFromRoom(room: RoomListItem): void {
    // A room never moves to another organization.
    this.roomOrganization.set(room.organization);
    this.roomForm.controls.organization.setValue(room.organization, { emitEvent: false });
    this.roomForm.controls.organization.disable({ emitEvent: false });
    this.roomForm.patchValue({
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeGuid: room.roomType.guid,
      status: room.status,
      notes: room.notes ?? '',
    });
    this.loadRoomTypeOptions(this.isAdmin() ? room.organization.guid : null);
  }

  private createRoom(): void {
    const organizationGuid = this.isAdmin()
      ? (this.roomForm.controls.organization.value?.guid ?? null)
      : null;
    this.submitRoom(
      this.roomService.create({ organizationGuid, ...this.buildRoomAttributes() }),
      $localize`Room created successfully.`,
    );
  }

  private updateRoom(): void {
    if (!this.roomGuid) {
      return;
    }
    this.submitRoom(
      this.roomService.update({ guid: this.roomGuid, ...this.buildRoomAttributes() }),
      $localize`Room updated successfully.`,
    );
  }

  /** Runs a create or update request, then returns to the listing on success. */
  private submitRoom(saveRequest: Observable<RoomListItem>, successMessage: string): void {
    this.isSubmitting.set(true);
    saveRequest.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.showSnackbar(successMessage, GenericSnackbarType.SUCCESS);
        void this.router.navigateByUrl(appRoutes.roomListing);
      },
      error: (error: HttpErrorResponse) => this.handleSubmitError(error),
    });
  }

  /** Form values sent on both create and update. */
  private buildRoomAttributes(): RoomAttributes {
    const formValue = this.roomForm.getRawValue();
    return {
      roomNumber: formValue.roomNumber.trim(),
      floor: formValue.floor ?? 0,
      roomTypeGuid: formValue.roomTypeGuid ?? '',
      status: formValue.status,
      notes: formValue.notes.trim() || null,
    };
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorResponse = error.error as ApiErrorResponse<unknown> | null;

    switch (errorResponse?.errorCode) {
      case ErrorCodes.ROOM_ALREADY_EXISTS: {
        const roomNumber = this.roomForm.controls.roomNumber.value.trim();
        this.showErrorBanner($localize`Room ${roomNumber} already exists in this organization.`);
        return;
      }
      case ErrorCodes.ROOM_TYPE_NOT_AVAILABLE_FOR_ROOM:
        this.showErrorBanner(
          $localize`The selected room type is no longer available. Choose another one.`,
        );
        this.loadRoomTypeOptions(this.isAdmin() ? (this.roomOrganization()?.guid ?? null) : null);
        return;
      case ErrorCodes.ORGANIZATION_NOT_FOUND:
      case ErrorCodes.ROOM_ORGANIZATION_REQUIRED:
        this.showErrorBanner($localize`Please choose an available organization.`);
        return;
      case ErrorCodes.ROOM_NOT_FOUND:
        this.roomNotFound.set(true);
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

  private isRoomNotFoundError(error: HttpErrorResponse): boolean {
    return (
      error.status === HttpStatusCode.NotFound ||
      (error.error as ApiErrorResponse<unknown> | null)?.errorCode === ErrorCodes.ROOM_NOT_FOUND
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
