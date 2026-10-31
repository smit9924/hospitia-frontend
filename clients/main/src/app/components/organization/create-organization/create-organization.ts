import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, switchMap } from 'rxjs';
import { Banner } from '../../common/banner/banner';
import { MinimalHeader } from '../../common/minimal-header/minimal-header';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { OwnerSelectionDialog } from '../owner-selection-dialog/owner-selection-dialog';
import { appRoutes } from '../../../data/app-routes';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { Organization } from '../../../services/organization/organization';
import { OrganizationType } from '../../../services/organization/organization-type';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import {
  OrganizationCreateAdminRequest,
  OrganizationCreateOwnerRequest,
  OrganizationDto,
} from '../../../types/interfaces/organization';
import { OrganizationTypeListItem } from '../../../types/interfaces/organization-type';
import { UserListItem } from '../../../types/interfaces/users';

type OrganizationForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  organizationTypeGuid: FormControl<string>;
  isActive: FormControl<boolean>;
  addressLine1: FormControl<string>;
  addressLine2: FormControl<string>;
  landmark: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  country: FormControl<string>;
  postalCode: FormControl<string>;
}>;

@Component({
  selector: 'app-create-organization',
  imports: [
    SecondaryNavbar,
    MinimalHeader,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    Banner,
    DecimalPipe,
  ],
  templateUrl: './create-organization.html',
  styleUrl: './create-organization.scss',
})
export class CreateOrganization implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly organizationService = inject(Organization);
  private readonly organizationTypeService = inject(OrganizationType);
  private readonly dialogService = inject(Dialog);
  private readonly dialog = inject(MatDialog);
  private readonly snackbarService = inject(Snackbar);

  @ViewChild('formBanner') banner!: Banner;
  private readonly onboardingHeading = viewChild<ElementRef<HTMLElement>>('onboardingHeading');

  protected readonly nameMaxLength = 255;
  protected readonly descriptionMaxLength = 1000;

  private readonly actingAsAdmin = this.route.snapshot.data['actingAsAdmin'] === true;
  private readonly isReadOnlyRoute = this.route.snapshot.data['readOnlyRoute'] === true;
  /** Owner's blocking first-organization step: the created organization becomes active. */
  protected readonly isOnboarding = this.route.snapshot.data['onboarding'] === true;

  protected readonly guid = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.guid());
  protected readonly isReadOnly = signal(false);
  protected readonly canToggleEdit = computed(() => !this.isReadOnlyRoute && this.isEditMode());
  protected readonly titleText = computed(() => {
    if (this.isEditMode()) {
      return this.isReadOnly() ? $localize`Organization Details` : $localize`Edit Organization`;
    }
    return $localize`Create Organization`;
  });
  protected readonly submitLabel = computed(() => {
    if (this.isEditMode()) {
      return $localize`Save`;
    }
    return this.isOnboarding ? $localize`Create and continue` : $localize`Create`;
  });

  protected readonly isLoadingOrganization = signal(false);
  protected readonly organizationNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showForm = computed(
    () => !this.isLoadingOrganization() && !this.organizationNotFound(),
  );

  protected readonly organizationTypes = signal<OrganizationTypeListItem[]>([]);
  protected readonly selectedOwner = signal<UserListItem | null>(null);
  protected readonly requiresOwnerSelection = computed(
    () => this.actingAsAdmin && !this.isEditMode(),
  );

  protected bannerMessage = '';

  protected readonly organizationForm = this.createOrganizationForm();

  constructor() {
    if (this.isOnboarding) {
      // Move focus to the page heading so screen readers announce the blocking step.
      afterNextRender(() => this.onboardingHeading()?.nativeElement.focus());
    }
  }

  ngOnInit(): void {
    this.loadOrganizationTypes();

    const guid = this.route.snapshot.queryParamMap.get('guid');
    const view = this.route.snapshot.queryParamMap.get('view') === 'true';

    if (this.isReadOnlyRoute) {
      this.isReadOnly.set(true);
    } else if (view) {
      this.isReadOnly.set(true);
    }

    if (!guid) {
      return;
    }

    this.guid.set(guid);
    this.loadOrganization(guid);
  }

  protected enableEditing(): void {
    this.isReadOnly.set(false);
    this.organizationForm.enable();
  }

  protected openOwnerSelection(): void {
    this.dialog
      .open<OwnerSelectionDialog, undefined, UserListItem | null>(OwnerSelectionDialog, {
        width: '640px',
      })
      .afterClosed()
      .subscribe((owner) => {
        if (owner) {
          this.selectedOwner.set(owner);
        }
      });
  }

  protected onSubmit(): void {
    if (!this.organizationForm.valid) {
      this.dialogService.openOkDialog(
        $localize`Validation Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (this.requiresOwnerSelection() && !this.selectedOwner()) {
      this.dialogService.openOkDialog(
        $localize`Owner Required`,
        $localize`Please select an owner for this organization before submitting.`,
      );
      return;
    }

    if (this.isEditMode()) {
      this.confirmAndSave();
      return;
    }

    this.createOrganization();
  }

  private createOrganizationForm(): OrganizationForm {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(this.nameMaxLength),
        ],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(this.descriptionMaxLength)],
      }),
      organizationTypeGuid: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      isActive: new FormControl(true, { nonNullable: true }),
      addressLine1: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      addressLine2: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(255)],
      }),
      landmark: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
      city: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      state: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      country: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      postalCode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern('^[1-9][0-9]{0,6}$')],
      }),
    });
  }

  private loadOrganizationTypes(): void {
    this.organizationTypeService
      .list({ searchTerm: '', pageSize: 100, sortBy: 'name', sortDirection: 'asc', pageNumber: 1 })
      .subscribe((response) => {
        this.organizationTypes.set(response.items);
      });
  }

  private loadOrganization(guid: string): void {
    this.isLoadingOrganization.set(true);
    this.organizationNotFound.set(false);

    this.organizationService
      .getOrganization(guid)
      .pipe(finalize(() => this.isLoadingOrganization.set(false)))
      .subscribe({
        next: (organization) => this.patchForm(organization),
        error: (error: HttpErrorResponse) => {
          if (
            error.status === HttpStatusCode.NotFound ||
            (error.error as ApiErrorResponse<unknown>)?.errorCode ===
              ErrorCodes.ORGANIZATION_NOT_FOUND
          ) {
            this.organizationNotFound.set(true);
            return;
          }
          if (error.status === HttpStatusCode.Forbidden) {
            this.organizationNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private patchForm(organization: OrganizationDto): void {
    this.organizationForm.patchValue({
      name: organization.name,
      description: organization.description ?? '',
      organizationTypeGuid: organization.organizationType.guid,
      isActive: organization.isActive,
      addressLine1: organization.address.addressLine1,
      addressLine2: organization.address.addressLine2 ?? '',
      landmark: organization.address.landmark ?? '',
      city: organization.address.city,
      state: organization.address.state,
      country: organization.address.country,
      postalCode: String(organization.address.postalCode),
    });

    if (organization.owner) {
      this.selectedOwner.set({
        guid: organization.owner.guid,
        firstName: organization.owner.firstName,
        lastName: organization.owner.lastName,
        username: organization.owner.username,
        email: organization.owner.email,
      });
    }

    if (this.isReadOnly()) {
      this.organizationForm.disable();
    }
  }

  private buildAddressInput() {
    const raw = this.organizationForm.getRawValue();
    return {
      addressLine1: raw.addressLine1,
      addressLine2: raw.addressLine2 || null,
      landmark: raw.landmark || null,
      city: raw.city,
      state: raw.state,
      country: raw.country,
      postalCode: Number(raw.postalCode),
    };
  }

  private createOrganization(): void {
    this.isSubmitting.set(true);

    const submit$ = this.actingAsAdmin
      ? this.organizationService.createAsAdmin(this.buildAdminPayload())
      : this.organizationService.createAsOwner(this.buildOwnerPayload());

    submit$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: (organization) => {
        this.showSuccessSnackbar($localize`Organization created successfully.`);
        if (this.isOnboarding) {
          this.activateCreatedOrganization(organization);
          return;
        }
        void this.router.navigateByUrl(this.listingRouteForActor());
      },
      error: (error: HttpErrorResponse) => this.handleSubmitError(error),
    });
  }

  private confirmAndSave(): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Confirm Changes`,
        $localize`Are you sure you want to save these changes?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => {
          this.isSubmitting.set(true);
          return this.actingAsAdmin
            ? this.organizationService.createAsAdmin(this.buildAdminPayload())
            : this.organizationService.createAsOwner(this.buildOwnerPayload());
        }),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.showSuccessSnackbar($localize`Organization updated successfully.`);
          void this.router.navigateByUrl(this.listingRouteForActor());
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private buildAdminPayload(): OrganizationCreateAdminRequest {
    const raw = this.organizationForm.getRawValue();
    return {
      guid: this.guid() ?? undefined,
      name: raw.name,
      description: raw.description || null,
      organizationTypeGuid: raw.organizationTypeGuid,
      address: this.buildAddressInput(),
      ownerUserGuid: this.selectedOwner()?.guid ?? '',
      isActive: raw.isActive,
    };
  }

  private buildOwnerPayload(): OrganizationCreateOwnerRequest {
    const raw = this.organizationForm.getRawValue();
    return {
      guid: this.guid() ?? undefined,
      name: raw.name,
      description: raw.description || null,
      organizationTypeGuid: raw.organizationTypeGuid,
      address: this.buildAddressInput(),
      isActive: raw.isActive,
    };
  }

  /** An owner's first organization becomes their active organization. */
  private activateCreatedOrganization(organization: OrganizationDto): void {
    this.organizationService.setActiveOrganization({
      guid: organization.guid,
      name: organization.name,
      organizationTypeName: organization.organizationType.name,
      city: organization.address.city,
    });
    void this.router.navigateByUrl(appRoutes.ownerDashboard);
  }

  private listingRouteForActor(): string {
    return this.actingAsAdmin
      ? appRoutes.organizationListingAdmin
      : appRoutes.organizationListingOwner;
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorRes = error.error as ApiErrorResponse<unknown>;

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_TYPE_NOT_FOUND) {
      this.showBanner($localize`The selected organization type could not be found.`);
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.USER_ROLE_MISMATCH_FOR_ORGANIZATION) {
      this.showBanner($localize`The selected owner is not eligible to own an organization.`);
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_ACCESS_FORBIDDEN) {
      this.showBanner($localize`You do not have access to modify this organization.`);
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_NOT_FOUND) {
      this.organizationNotFound.set(true);
      return;
    }

    throw error;
  }

  private showSuccessSnackbar(text: string): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text,
      type: GenericSnackbarType.SUCCESS,
    });
    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });
    this.snackbarService.open(snackbarConfig);
  }

  private showBanner(message: string, type: BANNER_TYPES = BANNER_TYPES.ERROR): void {
    this.bannerMessage = message;
    this.banner.type = type;
    this.banner.show();
  }
}
