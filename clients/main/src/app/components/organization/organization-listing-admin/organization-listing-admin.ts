import { DatePipe } from '@angular/common';
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
import { Organization } from '../../../services/organization/organization';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { OrganizationListItem, OrganizationSortBy } from '../../../types/interfaces/organization';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-organization-listing-admin',
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
    DatePipe,
  ],
  templateUrl: './organization-listing-admin.html',
  styleUrl: './organization-listing-admin.scss',
})
export class OrganizationListingAdmin implements OnInit {
  private readonly organizationService = inject(Organization);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Organizations`;
  protected readonly showOwnerColumn = true;
  protected readonly showActions = true;
  protected readonly displayedColumns = [
    'name',
    'organizationTypeName',
    'ownerDisplayName',
    'addressLine1',
    'city',
    'state',
    'country',
    'isActive',
    'createdBy',
    'updatedBy',
    'actions',
  ];
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly organizations = signal<OrganizationListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<OrganizationSortBy>('name');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasOrganizations = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(
    () => !this.hasOrganizations() && !!this.searchTerm(),
  );
  protected readonly showSearchbar = computed(
    () => this.hasOrganizations() || this.isEmptySearch(),
  );

  ngOnInit(): void {
    this.loadOrganizations();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadOrganizations();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as OrganizationSortBy) || 'name');
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadOrganizations();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrganizations();
  }

  protected createOrganization(): void {
    void this.router.navigateByUrl(appRoutes.createOrganizationAdmin);
  }

  protected async viewOrganization(organization: OrganizationListItem): Promise<void> {
    await this.router.navigate([appRoutes.createOrganizationAdmin], {
      queryParams: { guid: organization.guid, view: 'true' },
    });
  }

  protected async editOrganization(organization: OrganizationListItem): Promise<void> {
    await this.router.navigate([appRoutes.createOrganizationAdmin], {
      queryParams: { guid: organization.guid },
    });
  }

  protected deleteOrganization(organization: OrganizationListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Organization`,
        $localize`Are you sure you want to delete "${organization.name}"? This cannot be undone.`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.organizationService.deleteOrganization(organization.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar(
            $localize`Organization deleted successfully.`,
            GenericSnackbarType.SUCCESS,
          );
          this.loadOrganizations();
        },
        error: (error: HttpErrorResponse) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;

          if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_NOT_FOUND) {
            this.showSnackbar(
              $localize`This organization was already deleted.`,
              GenericSnackbarType.ERROR,
            );
          } else if (errorRes?.errorCode === ErrorCodes.ORGANIZATION_HAS_ACTIVE_DEPENDENCIES) {
            this.showSnackbar(errorRes.message, GenericSnackbarType.ERROR);
          } else {
            this.showSnackbar(
              $localize`Failed to delete organization. Please try again.`,
              GenericSnackbarType.ERROR,
            );
          }

          this.loadOrganizations();
        },
      });
  }

  protected loadOrganizations(): void {
    this.organizationService
      .listAdmin({
        searchTerm: this.searchTerm() || '',
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.organizations.set(response.items);
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
