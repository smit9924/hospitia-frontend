import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { Organization } from '../../../services/organization/organization';
import { OrganizationListItem } from '../../../types/interfaces/organization';
import { OrganizationReference } from '../../../types/interfaces/room-amenity';
import { Searchbar } from '../../common/searchbar/searchbar';

export interface AdminOrganizationSelectionDialogData {
  /** Organization chosen earlier, shown as selected when the dialog opens. */
  selectedOrganization: OrganizationReference | null;
}

/**
 * Dialog listing every active organization (searchable, paginated) for an
 * admin to pick exactly one. Closes with the picked organization on "Add",
 * or null on "Cancel".
 */
@Component({
  selector: 'app-admin-organization-selection-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    Searchbar,
  ],
  templateUrl: './admin-organization-selection-dialog.html',
  styleUrl: './admin-organization-selection-dialog.scss',
})
export class AdminOrganizationSelectionDialog implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<AdminOrganizationSelectionDialog, OrganizationReference | null>,
  );
  private readonly organizationService = inject(Organization);
  private readonly dialogData = inject<AdminOrganizationSelectionDialogData>(MAT_DIALOG_DATA);

  protected readonly displayedColumns = ['select', 'name', 'type', 'city', 'owner'];
  protected readonly pageSizeOptions = [5, 10, 25];

  protected readonly organizations = signal<OrganizationListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly hasOrganizations = computed(() => this.totalCount() > 0);

  /** Kept across searches and pages, so paging away does not lose the choice. */
  protected readonly selectedOrganization = signal<OrganizationReference | null>(
    this.dialogData?.selectedOrganization ?? null,
  );

  ngOnInit(): void {
    this.loadOrganizations();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadOrganizations();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOrganizations();
  }

  protected selectOrganization(organization: OrganizationListItem): void {
    this.selectedOrganization.set({ guid: organization.guid, name: organization.name });
  }

  protected isSelected(organization: OrganizationListItem): boolean {
    return this.selectedOrganization()?.guid === organization.guid;
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected addSelectedOrganization(): void {
    this.dialogRef.close(this.selectedOrganization());
  }

  private loadOrganizations(): void {
    this.isLoading.set(true);
    this.organizationService
      .listAdmin({
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortBy: 'name',
        sortDirection: 'asc',
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((response) => {
        this.organizations.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }
}
