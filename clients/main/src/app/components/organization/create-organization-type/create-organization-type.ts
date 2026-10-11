import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, switchMap } from 'rxjs';
import { Banner } from '../../common/banner/banner';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { appRoutes } from '../../../data/app-routes';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
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
import { OrganizationTypeUpsertRequest } from '../../../types/interfaces/organization-type';

type OrganizationTypeForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
}>;

@Component({
  selector: 'app-create-organization-type',
  imports: [
    SecondaryNavbar,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    Banner,
    DecimalPipe,
  ],
  templateUrl: './create-organization-type.html',
  styleUrl: './create-organization-type.scss',
})
export class CreateOrganizationType implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly organizationTypeService = inject(OrganizationType);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  @ViewChild('formBanner') banner!: Banner;

  protected readonly nameMaxLength = 100;
  protected readonly descriptionMaxLength = 500;

  protected readonly guid = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.guid());
  protected readonly titleText = computed(() =>
    this.isEditMode() ? $localize`Edit Organization Type` : $localize`Create Organization Type`,
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? $localize`Save` : $localize`Create`,
  );
  protected readonly isLoadingOrganizationType = signal(false);
  protected readonly organizationTypeNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showForm = computed(
    () => !this.isLoadingOrganizationType() && !this.organizationTypeNotFound(),
  );

  protected bannerMessage = '';

  protected readonly organizationTypeForm = this.createOrganizationTypeForm();

  ngOnInit(): void {
    const guid = this.route.snapshot.queryParamMap.get('guid');
    if (!guid) {
      return;
    }

    this.guid.set(guid);
    this.loadOrganizationType(guid);
  }

  protected onSubmit(): void {
    if (!this.organizationTypeForm.valid) {
      this.dialogService.openOkDialog(
        $localize`Validation Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (this.isEditMode()) {
      this.confirmAndSave();
      return;
    }

    this.createOrganizationType();
  }

  private createOrganizationTypeForm(): OrganizationTypeForm {
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
    });
  }

  private loadOrganizationType(guid: string): void {
    this.isLoadingOrganizationType.set(true);
    this.organizationTypeNotFound.set(false);

    this.organizationTypeService
      .getOrganizationType(guid)
      .pipe(finalize(() => this.isLoadingOrganizationType.set(false)))
      .subscribe({
        next: (organizationType) => {
          this.organizationTypeForm.patchValue({
            name: organizationType.name,
            description: organizationType.description ?? '',
          });
        },
        error: (error: HttpErrorResponse) => {
          if (
            error.status === HttpStatusCode.NotFound ||
            (error.error as ApiErrorResponse<unknown>)?.errorCode ===
              ErrorCodes.ORGANIZATION_TYPE_NOT_FOUND
          ) {
            this.organizationTypeNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private createOrganizationType(): void {
    const payload: OrganizationTypeUpsertRequest = {
      name: this.organizationTypeForm.getRawValue().name,
      description: this.organizationTypeForm.getRawValue().description || null,
    };

    this.isSubmitting.set(true);
    this.organizationTypeService
      .upsert(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.showSuccessSnackbar($localize`Organization type created successfully.`);
          void this.router.navigateByUrl(appRoutes.organizationTypeListing);
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
          const guid = this.guid();
          if (!guid) {
            throw new Error('Missing guid for edit');
          }

          const raw = this.organizationTypeForm.getRawValue();
          const payload: OrganizationTypeUpsertRequest = {
            guid,
            name: raw.name,
            description: raw.description || null,
          };

          this.isSubmitting.set(true);
          return this.organizationTypeService
            .upsert(payload)
            .pipe(finalize(() => this.isSubmitting.set(false)));
        }),
      )
      .subscribe({
        next: () => {
          this.showSuccessSnackbar($localize`Organization type updated successfully.`);
          void this.router.navigateByUrl(appRoutes.organizationTypeListing);
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorRes = error.error as ApiErrorResponse<unknown>;

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_TYPE_ALREADY_EXISTS) {
      this.showBanner(
        $localize`An organization type with this name already exists. Please choose a different name.`,
      );
      return;
    }

    if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_TYPE_NOT_FOUND) {
      this.organizationTypeNotFound.set(true);
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
