import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { User } from '../../../services/user/user';
import { UserListItem } from '../../../types/interfaces/users';
import { Searchbar } from '../../common/searchbar/searchbar';

@Component({
  selector: 'app-owner-selection-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatRadioModule,
    Searchbar,
  ],
  templateUrl: './owner-selection-dialog.html',
  styleUrl: './owner-selection-dialog.scss',
})
export class OwnerSelectionDialog implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<OwnerSelectionDialog, UserListItem | null>);
  private readonly userService = inject(User);

  protected readonly displayedColumns = ['select', 'firstName', 'lastName', 'username', 'email'];
  protected readonly pageSizeOptions = [5, 10, 25];

  protected readonly owners = signal<UserListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly searchTerm = signal('');
  protected readonly isLoading = signal(true);
  protected readonly hasOwners = computed(() => this.totalCount() > 0);

  protected readonly selected = signal<UserListItem | null>(null);

  ngOnInit(): void {
    this.loadOwners();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadOwners();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadOwners();
  }

  protected selectOwner(owner: UserListItem): void {
    this.selected.set(owner);
  }

  protected isSelected(owner: UserListItem): boolean {
    return this.selected()?.guid === owner.guid;
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected confirm(): void {
    this.dialogRef.close(this.selected());
  }

  private loadOwners(): void {
    this.isLoading.set(true);
    this.userService
      .listOwners({
        searchTerm: this.searchTerm() || '',
        pageSize: this.pageSize(),
        sortBy: 'firstName',
        sortDirection: 'asc',
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((response) => {
        this.owners.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }
}
