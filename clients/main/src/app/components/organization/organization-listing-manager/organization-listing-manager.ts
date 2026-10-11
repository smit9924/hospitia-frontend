import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { appRoutes } from '../../../data/app-routes';
import { Organization } from '../../../services/organization/organization';
import { OrganizationListItem, OrganizationSortBy } from '../../../types/interfaces/organization';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-organization-listing-manager',
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
  templateUrl: './organization-listing-manager.html',
  styleUrl: './organization-listing-manager.scss',
})
export class OrganizationListingManager implements OnInit {
  private readonly organizationService = inject(Organization);
  private readonly router = inject(Router);

  protected readonly titleText = $localize`My Organizations`;
  protected readonly displayedColumns = [
    'name',
    'organizationTypeName',
    'addressLine1',
    'city',
    'state',
    'country',
    'isActive',
    'createdBy',
    'updatedBy',
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

  protected async viewOrganization(organization: OrganizationListItem): Promise<void> {
    await this.router.navigate([appRoutes.viewOrganization], {
      queryParams: { guid: organization.guid },
    });
  }

  private loadOrganizations(): void {
    this.organizationService
      .listManager({
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
}
