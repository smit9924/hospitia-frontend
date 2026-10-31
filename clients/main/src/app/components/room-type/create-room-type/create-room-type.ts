import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { DEFAULT_CURRENCY_CODE } from '../../../data/constants';
import { CurrencyUnit } from '../../../services/currency-unit/currency-unit';
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { RoomAmenity } from '../../../services/room-amenity/room-amenity';
import { RoomType } from '../../../services/room-type/room-type';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { CurrencyUnitOption } from '../../../types/interfaces/currency-unit';
import {
  OrganizationReference,
  RoomAmenityListItem,
  RoomAmenityOption,
} from '../../../types/interfaces/room-amenity';
import { RoomTypeListItem, RoomTypeUpsertRequest } from '../../../types/interfaces/room-type';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Banner } from '../../common/banner/banner';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { OrganizationSelectionField } from '../../organization/organization-selection-field/organization-selection-field';
import {
  RoomAmenityDialog,
  RoomAmenityDialogData,
} from '../../room-amenity/room-amenity-dialog/room-amenity-dialog';

/** Limits shared with the backend (booking service `RoomType` model). */
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 1000;
/** Up to 999,999,999.99: nine whole digits and at most two decimal places. */
const COST_PER_NIGHT_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/** Rejects numbers with a fractional part (capacity is a whole number of guests). */
function wholeNumberValidator(control: AbstractControl<number | null>): ValidationErrors | null {
  const value = control.value;
  return value === null || Number.isInteger(value) ? null : { wholeNumber: true };
}

type RoomTypeForm = FormGroup<{
  organization: FormControl<OrganizationReference | null>;
  name: FormControl<string>;
  description: FormControl<string>;
  capacity: FormControl<number | null>;
  costPerNight: FormControl<string>;
  currencyUnitGuid: FormControl<string | null>;
}>;

/**
 * Page to create a room type, or edit one when the route has a `guid`
 * query parameter.
 *
 * Owners and managers create room types in their active organization.
 * Admins choose the organization first; it cannot change afterwards.
 * Amenities offered are the defaults plus the organization's custom ones,
 * and new amenities can be added inline without leaving the form.
 */
@Component({
  selector: 'app-create-room-type',
  imports: [
    SecondaryNavbar,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    Banner,
    OrganizationSelectionField,
    DecimalPipe,
  ],
  templateUrl: './create-room-type.html',
  styleUrl: './create-room-type.scss',
})
export class CreateRoomType implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);
  private readonly profileService = inject(Profile);
  private readonly roomTypeService = inject(RoomType);
  private readonly roomAmenityService = inject(RoomAmenity);
  private readonly currencyUnitService = inject(CurrencyUnit);

  private readonly banner = viewChild<Banner>('formBanner');

  protected readonly nameMaxLength = 100;
  protected readonly descriptionMaxLength = 500;
  protected readonly minCapacity = MIN_CAPACITY;
  protected readonly maxCapacity = MAX_CAPACITY;

  /** GUID of the room type to edit, from the `guid` query parameter; null when creating. */
  protected readonly roomTypeGuid = this.route.snapshot.queryParamMap.get('guid');
  protected readonly isEditMode = !!this.roomTypeGuid;
  protected readonly titleText = this.isEditMode
    ? $localize`Edit Room Type`
    : $localize`Create Room Type`;
  protected readonly submitLabel = this.isEditMode ? $localize`Save` : $localize`Create`;

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );

  protected readonly isLoadingRoomType = signal(false);
  protected readonly roomTypeNotFound = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly currencyOptions = signal<CurrencyUnitOption[]>([]);
  protected readonly amenityOptions = signal<RoomAmenityOption[]>([]);
  protected readonly isLoadingAmenities = signal(false);
  /** GUIDs of the checked amenities; kept across amenity list reloads. */
  protected readonly selectedAmenityGuids = signal<ReadonlySet<string>>(new Set());
  /** Organization whose amenities are offered (admins pick it; members use their active one). */
  protected readonly amenityOrganization = signal<OrganizationReference | null>(null);
  /** Admins must pick an organization before amenities can be listed or added. */
  protected readonly canChooseAmenities = computed(
    () => !this.isAdmin() || this.amenityOrganization() !== null,
  );

  protected bannerMessage = '';

  protected readonly roomTypeForm: RoomTypeForm = new FormGroup({
    organization: new FormControl<OrganizationReference | null>(null),
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(this.nameMaxLength),
      ],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(this.descriptionMaxLength)],
    }),
    capacity: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(MIN_CAPACITY),
        Validators.max(MAX_CAPACITY),
        wholeNumberValidator,
      ],
    }),
    costPerNight: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(COST_PER_NIGHT_PATTERN)],
    }),
    currencyUnitGuid: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  /** Currency code shown as the cost field's prefix. */
  protected readonly selectedCurrencyCode = signal('');

  ngOnInit(): void {
    this.watchCurrencySelection();
    if (this.isAdmin()) {
      this.roomTypeForm.controls.organization.setValidators(Validators.required);
      this.watchAdminOrganizationSelection();
    }

    if (this.roomTypeGuid) {
      this.loadRoomType(this.roomTypeGuid);
    } else {
      this.loadCurrencyOptions();
      if (!this.isAdmin()) {
        this.loadAmenityOptions(null);
      }
    }
  }

  protected isAmenitySelected(amenity: RoomAmenityOption): boolean {
    return this.selectedAmenityGuids().has(amenity.guid);
  }

  protected toggleAmenity(amenity: RoomAmenityOption, isChecked: boolean): void {
    this.selectedAmenityGuids.update((selected) => {
      const updated = new Set(selected);
      if (isChecked) {
        updated.add(amenity.guid);
      } else {
        updated.delete(amenity.guid);
      }
      return updated;
    });
  }

  /** Opens the amenity dialog; a created amenity is listed and checked right away. */
  protected openAddAmenityDialog(): void {
    const dialogData: RoomAmenityDialogData = {
      // Members' amenities always belong to their active organization.
      organization: this.isAdmin() ? this.amenityOrganization() : null,
    };
    this.matDialog
      .open<RoomAmenityDialog, RoomAmenityDialogData, RoomAmenityListItem | null>(
        RoomAmenityDialog,
        { data: dialogData, width: '640px', maxWidth: '95vw' },
      )
      .afterClosed()
      .pipe(filter((amenity): amenity is RoomAmenityListItem => !!amenity))
      .subscribe((amenity) => {
        this.selectedAmenityGuids.update((selected) => new Set([...selected, amenity.guid]));
        this.loadAmenityOptions(this.amenityOrganization()?.guid ?? null);
        this.showSnackbar(
          $localize`Amenity "${amenity.name}" added and selected.`,
          GenericSnackbarType.SUCCESS,
        );
      });
  }

  protected onSubmit(): void {
    if (!this.roomTypeForm.valid) {
      this.roomTypeForm.markAllAsTouched();
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
        .subscribe(() => this.saveRoomType($localize`Room type updated successfully.`));
      return;
    }

    this.saveRoomType($localize`Room type created successfully.`);
  }

  /** Keeps the cost prefix in sync with the chosen currency. */
  private watchCurrencySelection(): void {
    this.roomTypeForm.controls.currencyUnitGuid.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currencyUnitGuid) => this.updateSelectedCurrencyCode(currencyUnitGuid));
  }

  private updateSelectedCurrencyCode(currencyUnitGuid: string | null): void {
    const currency = this.currencyOptions().find((option) => option.guid === currencyUnitGuid);
    this.selectedCurrencyCode.set(currency?.currencyCode ?? '');
  }

  /** Reloads the amenities when an admin picks another organization. */
  private watchAdminOrganizationSelection(): void {
    this.roomTypeForm.controls.organization.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((organization) => {
        if (organization?.guid === this.amenityOrganization()?.guid) {
          return;
        }
        this.amenityOrganization.set(organization);
        if (organization) {
          this.loadAmenityOptions(organization.guid);
        } else {
          this.amenityOptions.set([]);
          this.selectedAmenityGuids.set(new Set());
        }
      });
  }

  private loadCurrencyOptions(preferredCurrencyGuid: string | null = null): void {
    this.currencyUnitService.listOptions().subscribe((currencies) => {
      this.currencyOptions.set(currencies);
      const currencyControl = this.roomTypeForm.controls.currencyUnitGuid;
      const preferredGuid =
        preferredCurrencyGuid ??
        currencies.find((currency) => currency.currencyCode === DEFAULT_CURRENCY_CODE)?.guid ??
        null;
      const keepsCurrentChoice = currencies.some(
        (currency) => currency.guid === currencyControl.value,
      );
      if (!keepsCurrentChoice) {
        currencyControl.setValue(preferredGuid);
      }
      this.updateSelectedCurrencyCode(currencyControl.value);
    });
  }

  /**
   * Loads the selectable amenities and drops checked amenities that are no
   * longer offered (e.g. another organization's custom ones).
   */
  private loadAmenityOptions(organizationGuid: string | null): void {
    this.isLoadingAmenities.set(true);
    this.roomAmenityService
      .listSelectable(organizationGuid)
      .pipe(finalize(() => this.isLoadingAmenities.set(false)))
      .subscribe((amenities) => {
        this.amenityOptions.set(amenities);
        const offeredGuids = new Set(amenities.map((amenity) => amenity.guid));
        this.selectedAmenityGuids.update(
          (selected) => new Set([...selected].filter((guid) => offeredGuids.has(guid))),
        );
      });
  }

  private loadRoomType(guid: string): void {
    this.isLoadingRoomType.set(true);
    this.roomTypeService
      .getRoomType(guid)
      .pipe(finalize(() => this.isLoadingRoomType.set(false)))
      .subscribe({
        next: (roomType) => this.fillFormFromRoomType(roomType),
        error: (error: HttpErrorResponse) => {
          if (this.isRoomTypeNotFoundError(error)) {
            this.roomTypeNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private fillFormFromRoomType(roomType: RoomTypeListItem): void {
    // A room type never moves to another organization.
    this.amenityOrganization.set(roomType.organization);
    this.roomTypeForm.controls.organization.setValue(roomType.organization, { emitEvent: false });
    this.roomTypeForm.controls.organization.disable({ emitEvent: false });
    this.roomTypeForm.patchValue({
      name: roomType.name,
      description: roomType.description ?? '',
      capacity: roomType.capacity,
      costPerNight: roomType.costPerNight,
      currencyUnitGuid: roomType.currencyUnit.guid,
    });
    this.selectedAmenityGuids.set(new Set(roomType.amenities.map((amenity) => amenity.guid)));
    this.loadCurrencyOptions(roomType.currencyUnit.guid);
    this.loadAmenityOptions(this.isAdmin() ? roomType.organization.guid : null);
  }

  private saveRoomType(successMessage: string): void {
    this.isSubmitting.set(true);
    this.roomTypeService
      .upsert(this.buildUpsertRequest())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.showSnackbar(successMessage, GenericSnackbarType.SUCCESS);
          void this.router.navigateByUrl(appRoutes.roomTypeListing);
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private buildUpsertRequest(): RoomTypeUpsertRequest {
    const formValue = this.roomTypeForm.getRawValue();
    return {
      guid: this.roomTypeGuid,
      organizationGuid: this.isAdmin() ? (formValue.organization?.guid ?? null) : null,
      name: formValue.name.trim(),
      description: formValue.description.trim() || null,
      capacity: formValue.capacity ?? 0,
      costPerNight: formValue.costPerNight.trim(),
      currencyUnitGuid: formValue.currencyUnitGuid ?? '',
      // Keep the order of the list the user saw.
      amenityGuids: this.amenityOptions()
        .map((amenity) => amenity.guid)
        .filter((guid) => this.selectedAmenityGuids().has(guid)),
    };
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorResponse = error.error as ApiErrorResponse<unknown> | null;

    switch (errorResponse?.errorCode) {
      case ErrorCodes.ROOM_TYPE_ALREADY_EXISTS:
        this.showErrorBanner(
          $localize`This organization already has a room type with this name. Please choose a different name.`,
        );
        return;
      case ErrorCodes.ROOM_TYPE_AMENITY_NOT_AVAILABLE:
        this.showErrorBanner(
          $localize`Some selected amenities are no longer available. The list has been refreshed; please review it.`,
        );
        this.loadAmenityOptions(this.isAdmin() ? (this.amenityOrganization()?.guid ?? null) : null);
        return;
      case ErrorCodes.CURRENCY_UNIT_NOT_FOUND:
        this.showErrorBanner(
          $localize`The selected currency is no longer available. Please choose another one.`,
        );
        this.roomTypeForm.controls.currencyUnitGuid.setValue(null);
        this.loadCurrencyOptions();
        return;
      case ErrorCodes.ORGANIZATION_NOT_FOUND:
      case ErrorCodes.ROOM_TYPE_ORGANIZATION_REQUIRED:
        this.showErrorBanner($localize`Please choose an available organization.`);
        return;
      case ErrorCodes.ROOM_TYPE_NOT_FOUND:
        this.roomTypeNotFound.set(true);
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

  private isRoomTypeNotFoundError(error: HttpErrorResponse): boolean {
    return (
      error.status === HttpStatusCode.NotFound ||
      (error.error as ApiErrorResponse<unknown> | null)?.errorCode ===
        ErrorCodes.ROOM_TYPE_NOT_FOUND
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
