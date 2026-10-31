import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { filter, finalize } from 'rxjs';
import { Dialog } from '../../../services/dialog';
import { Organization } from '../../../services/organization/organization';
import { Profile } from '../../../services/profile';
import { RoomAmenity } from '../../../services/room-amenity/room-amenity';
import { UserType } from '../../../types/enums/auth';
import { BANNER_TYPES } from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import {
  OrganizationReference,
  RoomAmenityListItem,
  RoomAmenityUpsertRequest,
} from '../../../types/interfaces/room-amenity';
import { Banner } from '../../common/banner/banner';
import { OrganizationPicker } from '../../organization/organization-picker/organization-picker';

/** Whether an admin's new amenity is offered to everyone or to one organization. */
type AmenityAvailability = 'default' | 'organization';

type RoomAmenityFormGroup = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  availability: FormControl<AmenityAvailability>;
  organization: FormControl<OrganizationReference | null>;
}>;

/**
 * Create/edit form for one room amenity, shared by the amenity page and the
 * "Add new amenity" dialog of the room type form.
 *
 * Who creates what:
 * - Admins choose between a default amenity (offered to every
 *   organization) and a custom amenity of one organization, unless
 *   `organizationForNewAmenity` fixes the organization.
 * - Owners and managers always create custom amenities of their active
 *   organization.
 *
 * Owners and managers see default amenities read-only.
 */
@Component({
  selector: 'app-room-amenity-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    Banner,
    OrganizationPicker,
    DecimalPipe,
  ],
  templateUrl: './room-amenity-form.html',
})
export class RoomAmenityForm implements OnInit {
  private readonly roomAmenityService = inject(RoomAmenity);
  private readonly dialogService = inject(Dialog);
  private readonly profileService = inject(Profile);
  private readonly organizationService = inject(Organization);

  private readonly banner = viewChild<Banner>('formBanner');

  /** GUID of the amenity to edit; null creates a new amenity. */
  readonly amenityGuid = input<string | null>(null);
  /** Fixes the organization of a new amenity (admin creating inline for a room type). */
  readonly organizationForNewAmenity = input<OrganizationReference | null>(null);
  /** Ask for confirmation before saving changes to an existing amenity. */
  readonly confirmBeforeUpdate = input(true);
  readonly showCancelButton = input(false);

  /** Emits the saved amenity after a successful create or update. */
  readonly saved = output<RoomAmenityListItem>();
  readonly cancelled = output<void>();

  protected readonly nameMaxLength = 100;
  protected readonly descriptionMaxLength = 500;

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );
  /**
   * Organization a new amenity is created for when it is fixed: the given
   * organization, or a member's active organization. Null when an admin
   * chooses the scope.
   */
  protected readonly newAmenityOrganizationName = computed((): string | null => {
    const fixedOrganization = this.organizationForNewAmenity();
    if (fixedOrganization) {
      return fixedOrganization.name;
    }
    if (this.isAdmin()) {
      return null;
    }
    return this.organizationService.activeOrganization()?.name ?? null;
  });
  protected readonly isEditMode = computed(() => !!this.amenityGuid());
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? $localize`Save` : $localize`Create`,
  );

  protected readonly isLoadingAmenity = signal(false);
  protected readonly amenityNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  /** Amenity being edited, used to describe its scope. */
  protected readonly loadedAmenity = signal<RoomAmenityListItem | null>(null);
  /** Owners and managers cannot change default amenities. */
  protected readonly isReadOnly = computed(() => {
    const amenity = this.loadedAmenity();
    return !!amenity && amenity.isDefault && !this.isAdmin();
  });
  /** Admins pick the scope of a new amenity unless the organization is fixed. */
  protected readonly showAvailabilityChoice = computed(
    () => this.isAdmin() && !this.isEditMode() && !this.organizationForNewAmenity(),
  );
  protected readonly selectedAvailability = signal<AmenityAvailability>('default');

  protected bannerMessage = '';

  protected readonly amenityForm: RoomAmenityFormGroup = new FormGroup({
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
    availability: new FormControl<AmenityAvailability>('default', { nonNullable: true }),
    organization: new FormControl<OrganizationReference | null>(null),
  });

  ngOnInit(): void {
    this.amenityForm.controls.availability.valueChanges.subscribe((availability) =>
      this.applyAvailability(availability),
    );

    const amenityGuid = this.amenityGuid();
    if (amenityGuid) {
      this.loadAmenity(amenityGuid);
    }
  }

  protected onSubmit(): void {
    if (this.isReadOnly()) {
      return;
    }
    if (!this.amenityForm.valid) {
      this.amenityForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode() && this.confirmBeforeUpdate()) {
      this.dialogService
        .openConfirmDialog(
          $localize`Confirm Changes`,
          $localize`Are you sure you want to save these changes?`,
        )
        .afterClosed()
        .pipe(filter((confirmed): confirmed is true => confirmed === true))
        .subscribe(() => this.saveAmenity());
      return;
    }

    this.saveAmenity();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  /** The organization picker is required only for an admin's organization-specific amenity. */
  private applyAvailability(availability: AmenityAvailability): void {
    this.selectedAvailability.set(availability);
    const organizationControl = this.amenityForm.controls.organization;
    if (availability === 'organization') {
      organizationControl.setValidators(Validators.required);
    } else {
      organizationControl.clearValidators();
      organizationControl.setValue(null);
    }
    organizationControl.updateValueAndValidity();
  }

  private loadAmenity(guid: string): void {
    this.isLoadingAmenity.set(true);
    this.amenityNotFound.set(false);

    this.roomAmenityService
      .getRoomAmenity(guid)
      .pipe(finalize(() => this.isLoadingAmenity.set(false)))
      .subscribe({
        next: (amenity) => {
          this.loadedAmenity.set(amenity);
          this.amenityForm.patchValue({
            name: amenity.name,
            description: amenity.description ?? '',
          });
          if (this.isReadOnly()) {
            this.amenityForm.disable();
          }
        },
        error: (error: HttpErrorResponse) => {
          if (this.isNotFoundError(error)) {
            this.amenityNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private saveAmenity(): void {
    this.isSubmitting.set(true);
    this.roomAmenityService
      .upsert(this.buildUpsertRequest())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (amenity) => this.saved.emit(amenity),
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private buildUpsertRequest(): RoomAmenityUpsertRequest {
    const formValue = this.amenityForm.getRawValue();
    return {
      guid: this.amenityGuid(),
      name: formValue.name.trim(),
      description: formValue.description.trim() || null,
      organizationGuid: this.resolveOrganizationGuidForNewAmenity(),
    };
  }

  /** Organization of a new admin-created amenity; null means a default amenity. */
  private resolveOrganizationGuidForNewAmenity(): string | null {
    const fixedOrganization = this.organizationForNewAmenity();
    if (fixedOrganization) {
      return fixedOrganization.guid;
    }
    if (this.isAdmin() && this.selectedAvailability() === 'organization') {
      return this.amenityForm.controls.organization.value?.guid ?? null;
    }
    // Owners and managers: the backend uses the active organization.
    return null;
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorResponse = error.error as ApiErrorResponse<unknown> | null;

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showErrorBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }
    if (errorResponse?.errorCode === ErrorCodes.ROOM_AMENITY_ALREADY_EXISTS) {
      // The backend says whether a default or a sibling amenity uses the name.
      this.showErrorBanner(errorResponse.message);
      return;
    }
    if (errorResponse?.errorCode === ErrorCodes.ROOM_AMENITY_MODIFICATION_FORBIDDEN) {
      this.showErrorBanner($localize`Only admins can change default room amenities.`);
      return;
    }
    if (errorResponse?.errorCode === ErrorCodes.ORGANIZATION_NOT_FOUND) {
      this.showErrorBanner(
        $localize`The selected organization is no longer available. Please choose another one.`,
      );
      return;
    }
    if (this.isNotFoundError(error)) {
      this.amenityNotFound.set(true);
      return;
    }

    throw error;
  }

  private isNotFoundError(error: HttpErrorResponse): boolean {
    return (
      (error.error as ApiErrorResponse<unknown> | null)?.errorCode ===
        ErrorCodes.ROOM_AMENITY_NOT_FOUND ||
      (error.status === HttpStatusCode.NotFound && this.isEditMode())
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
}
