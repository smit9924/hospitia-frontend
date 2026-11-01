import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { filter, finalize, switchMap } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { CurrencyUnit } from '../../../services/currency-unit/currency-unit';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { CurrencyUnitListItem, CurrencyUnitSortBy } from '../../../types/interfaces/currency-unit';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

const DEFAULT_SORT_BY: CurrencyUnitSortBy = 'currencyCode';

/** Admin listing of active currency units with search, sort, pagination, edit and delete. */
@Component({
  selector: 'app-currency-unit-listing',
  imports: [
    SecondaryNavbar,
    Searchbar,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    CustomMatTooltip,
  ],
  templateUrl: './currency-unit-listing.html',
  styleUrl: './currency-unit-listing.scss',
})
export class CurrencyUnitListing implements OnInit {
  private readonly currencyUnitService = inject(CurrencyUnit);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Currency Units`;
  protected readonly displayedColumns = [
    'currencyCode',
    'currencyName',
    'numericCode',
    'minorUnit',
    'actions',
  ];
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly currencyUnits = signal<CurrencyUnitListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<CurrencyUnitSortBy>(DEFAULT_SORT_BY);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasCurrencyUnits = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(
    () => !this.hasCurrencyUnits() && !!this.searchTerm(),
  );
  protected readonly showSearchbar = computed(
    () => this.hasCurrencyUnits() || this.isEmptySearch(),
  );

  ngOnInit(): void {
    this.loadCurrencyUnits();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadCurrencyUnits();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as CurrencyUnitSortBy) || DEFAULT_SORT_BY);
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadCurrencyUnits();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCurrencyUnits();
  }

  protected createCurrencyUnit(): void {
    void this.router.navigateByUrl(appRoutes.createCurrencyUnit);
  }

  protected editCurrencyUnit(currencyUnit: CurrencyUnitListItem): void {
    void this.router.navigate([appRoutes.createCurrencyUnit], {
      queryParams: { guid: currencyUnit.guid },
    });
  }

  /** Accessible name of a row's actions menu button, e.g. "Actions for INR". */
  protected getActionsMenuLabel(currencyUnit: CurrencyUnitListItem): string {
    return $localize`Actions for ${currencyUnit.currencyCode}`;
  }

  /** Shows the minor unit, or a dash when ISO 4217 defines none. */
  protected formatMinorUnit(currencyUnit: CurrencyUnitListItem): string {
    return currencyUnit.minorUnit === null ? '-' : String(currencyUnit.minorUnit);
  }

  protected deleteCurrencyUnit(currencyUnit: CurrencyUnitListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Currency Unit`,
        $localize`Are you sure you want to delete "${currencyUnit.currencyCode} - ${currencyUnit.currencyName}"?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.currencyUnitService.delete(currencyUnit.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar(
            $localize`Currency unit deleted successfully.`,
            GenericSnackbarType.SUCCESS,
          );
          this.loadCurrencyUnits();
        },
        error: (error: HttpErrorResponse) => {
          this.showSnackbar(this.getDeleteErrorMessage(error), GenericSnackbarType.ERROR);
          // Refresh on error too: the row may already be gone, or state may
          // have changed from another session — keep the table consistent.
          this.loadCurrencyUnits();
        },
      });
  }

  private getDeleteErrorMessage(error: HttpErrorResponse): string {
    const errorCode = (error.error as ApiErrorResponse<unknown> | null)?.errorCode;
    if (errorCode === ErrorCodes.CURRENCY_UNIT_NOT_FOUND) {
      return $localize`This currency unit was already deleted.`;
    }
    if (errorCode === ErrorCodes.CURRENCY_UNIT_IN_USE) {
      return $localize`This currency unit is still in use and cannot be deleted.`;
    }
    return $localize`Failed to delete currency unit. Please try again.`;
  }

  private loadCurrencyUnits(): void {
    this.currencyUnitService
      .list({
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.currencyUnits.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }

  private showSnackbar(text: string, type: GenericSnackbarType): void {
    const snackbarConfigData = new GenericSnackbarConfigData({ text, type });
    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });
    this.snackbarService.open(snackbarConfig);
  }
}
