import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { CurrencyUnit } from '../../../services/currency-unit/currency-unit';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { CurrencyUnitUpsertRequest } from '../../../types/interfaces/currency-unit';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Banner } from '../../common/banner/banner';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

/** ISO 4217 alphabetic code: three letters (stored uppercase). */
const CURRENCY_CODE_PATTERN = /^[A-Za-z]{3}$/;
/** ISO 4217 numeric code: exactly three digits, leading zeros allowed. */
const NUMERIC_CODE_PATTERN = /^[0-9]{3}$/;

type CurrencyUnitForm = FormGroup<{
  currencyCode: FormControl<string>;
  numericCode: FormControl<string>;
  currencyName: FormControl<string>;
  minorUnit: FormControl<number | null>;
}>;

/**
 * Admin form to create a currency unit, or edit one when the route has a
 * `guid` query parameter. Field rules mirror the backend's ISO 4217 rules.
 */
@Component({
  selector: 'app-create-currency-unit',
  imports: [
    SecondaryNavbar,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    Banner,
    DecimalPipe,
  ],
  templateUrl: './create-currency-unit.html',
})
export class CreateCurrencyUnit implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currencyUnitService = inject(CurrencyUnit);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  private readonly banner = viewChild<Banner>('formBanner');

  protected readonly currencyNameMaxLength = 100;
  /** ISO 4217 minor units range from 0 to 4 decimal places. */
  protected readonly minorUnitOptions = [0, 1, 2, 3, 4];

  protected readonly guid = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.guid());
  protected readonly titleText = computed(() =>
    this.isEditMode() ? $localize`Edit Currency Unit` : $localize`Create Currency Unit`,
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? $localize`Save` : $localize`Create`,
  );
  protected readonly isLoadingCurrencyUnit = signal(false);
  protected readonly currencyUnitNotFound = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showForm = computed(
    () => !this.isLoadingCurrencyUnit() && !this.currencyUnitNotFound(),
  );

  protected bannerMessage = '';

  protected readonly currencyUnitForm: CurrencyUnitForm = new FormGroup({
    currencyCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(CURRENCY_CODE_PATTERN)],
    }),
    numericCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(NUMERIC_CODE_PATTERN)],
    }),
    currencyName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(this.currencyNameMaxLength),
      ],
    }),
    minorUnit: new FormControl<number | null>(2),
  });

  ngOnInit(): void {
    const guid = this.route.snapshot.queryParamMap.get('guid');
    if (!guid) {
      return;
    }

    this.guid.set(guid);
    this.loadCurrencyUnit(guid);
  }

  /** Keeps the alphabetic code uppercase while the user types. */
  protected uppercaseCurrencyCode(): void {
    const control = this.currencyUnitForm.controls.currencyCode;
    const uppercaseValue = control.value.toUpperCase();
    if (uppercaseValue !== control.value) {
      control.setValue(uppercaseValue);
    }
  }

  protected onSubmit(): void {
    if (!this.currencyUnitForm.valid) {
      this.currencyUnitForm.markAllAsTouched();
      this.dialogService.openOkDialog(
        $localize`Validation Failed`,
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (this.isEditMode()) {
      this.confirmAndUpdateCurrencyUnit();
      return;
    }

    this.saveCurrencyUnit($localize`Currency unit created successfully.`);
  }

  private loadCurrencyUnit(guid: string): void {
    this.isLoadingCurrencyUnit.set(true);
    this.currencyUnitNotFound.set(false);

    this.currencyUnitService
      .getCurrencyUnit(guid)
      .pipe(finalize(() => this.isLoadingCurrencyUnit.set(false)))
      .subscribe({
        next: (currencyUnit) => {
          this.currencyUnitForm.patchValue({
            currencyCode: currencyUnit.currencyCode,
            numericCode: currencyUnit.numericCode,
            currencyName: currencyUnit.currencyName,
            minorUnit: currencyUnit.minorUnit,
          });
        },
        error: (error: HttpErrorResponse) => {
          if (this.isNotFoundError(error)) {
            this.currencyUnitNotFound.set(true);
            return;
          }
          throw error;
        },
      });
  }

  private confirmAndUpdateCurrencyUnit(): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Confirm Changes`,
        $localize`Are you sure you want to save these changes?`,
      )
      .afterClosed()
      .pipe(filter((confirmed): confirmed is true => confirmed === true))
      .subscribe(() => this.saveCurrencyUnit($localize`Currency unit updated successfully.`));
  }

  /** Sends the form to the API, then returns to the listing on success. */
  private saveCurrencyUnit(successMessage: string): void {
    this.isSubmitting.set(true);
    this.currencyUnitService
      .upsert(this.buildUpsertRequest())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.showSuccessSnackbar(successMessage);
          void this.router.navigateByUrl(appRoutes.currencyUnitListing);
        },
        error: (error: HttpErrorResponse) => this.handleSubmitError(error),
      });
  }

  private buildUpsertRequest(): CurrencyUnitUpsertRequest {
    const formValue = this.currencyUnitForm.getRawValue();
    return {
      guid: this.guid(),
      currencyCode: formValue.currencyCode.trim().toUpperCase(),
      numericCode: formValue.numericCode.trim(),
      currencyName: formValue.currencyName.trim(),
      minorUnit: formValue.minorUnit,
    };
  }

  private handleSubmitError(error: HttpErrorResponse): void {
    const errorResponse = error.error as ApiErrorResponse<unknown> | null;

    if (error.status === HttpStatusCode.UnprocessableEntity) {
      this.showBanner(
        $localize`Please ensure all fields are filled out correctly before submitting the form.`,
      );
      return;
    }

    if (errorResponse?.errorCode === ErrorCodes.CURRENCY_UNIT_ALREADY_EXISTS) {
      // The backend says which code clashes; show its message as-is.
      this.showBanner(errorResponse.message);
      return;
    }

    if (this.isNotFoundError(error)) {
      this.currencyUnitNotFound.set(true);
      return;
    }

    throw error;
  }

  private isNotFoundError(error: HttpErrorResponse): boolean {
    return (
      error.status === HttpStatusCode.NotFound ||
      (error.error as ApiErrorResponse<unknown> | null)?.errorCode ===
        ErrorCodes.CURRENCY_UNIT_NOT_FOUND
    );
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
    const banner = this.banner();
    if (!banner) {
      return;
    }
    this.bannerMessage = message;
    banner.type = type;
    banner.show();
  }
}
