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
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { appRoutes } from '../../../data/app-routes';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { OrganizationType } from '../../../services/organization/organization-type';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import {
  OrganizationTypeListItem,
  OrganizationTypeSortBy,
} from '../../../types/interfaces/organization-type';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-organization-type-listing',
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
  templateUrl: './organization-type-listing.html',
  styleUrl: './organization-type-listing.scss',
})
export class OrganizationTypeListing implements OnInit {
  private readonly organizationTypeService = inject(OrganizationType);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Organization Types`;
  protected readonly displayedColumns = ['name', 'description', 'actions'];
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly organizationTypes = signal<OrganizationTypeListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<OrganizationTypeSortBy>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasOrganizationTypes = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(
    () => !this.hasOrganizationTypes() && !!this.searchTerm(),
  );
  protected readonly showSearchbar = computed(
    () => this.hasOrganizationTypes() || this.isEmptySearch(),
  );

  ngOnInit(): void {
    this.loadOrganizationTypes();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadOrganizationTypes();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as OrganizationTypeSortBy) || 'name');
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadOrganizationTypes();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrganizationTypes();
  }

  protected createOrganizationType(): void {
    void this.router.navigateByUrl(appRoutes.createOrganizationType);
  }

  protected async editOrganizationType(organizationType: OrganizationTypeListItem): Promise<void> {
    await this.router.navigate([appRoutes.createOrganizationType], {
      queryParams: { guid: organizationType.guid },
    });
  }

  protected deleteOrganizationType(organizationType: OrganizationTypeListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Organization Type`,
        $localize`Are you sure you want to delete "${organizationType.name}"? This cannot be undone.`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.organizationTypeService.delete(organizationType.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar(
            $localize`Organization type deleted successfully.`,
            GenericSnackbarType.SUCCESS,
          );
          this.loadOrganizationTypes();
        },
        error: (error: HttpErrorResponse) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;

          if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_TYPE_NOT_FOUND) {
            this.showSnackbar(
              $localize`This organization type was already deleted.`,
              GenericSnackbarType.ERROR,
            );
          } else if (
            errorRes?.errorCode === ErrorCodes.ORGANIZATION_TYPE_HAS_ACTIVE_ORGANIZATIONS
          ) {
            this.showSnackbar(
              $localize`This organization type is still in use and cannot be deleted.`,
              GenericSnackbarType.ERROR,
            );
          } else {
            this.showSnackbar(
              $localize`Failed to delete organization type. Please try again.`,
              GenericSnackbarType.ERROR,
            );
          }

          // Refresh on error too: the row may already be gone, or state may
          // have changed from another session — keep the table consistent.
          this.loadOrganizationTypes();
        },
      });
  }

  private loadOrganizationTypes(): void {
    this.organizationTypeService
      .list({
        searchTerm: this.searchTerm() || '',
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.organizationTypes.set(response.items);
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
