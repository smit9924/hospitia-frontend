import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { User } from '../../../services/user/user';
import {
  UserListItem,
  UserListSortBy,
  UserListSortDirection,
} from '../../../types/interfaces/users';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-owner-listing',
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
  templateUrl: './owner-listing.html',
  styleUrl: './owner-listing.scss',
})
export class OwnerListing implements OnInit {
  private readonly userService = inject(User);

  protected readonly titleText = $localize`Owners`;
  protected readonly displayedColumns = ['firstName', 'lastName', 'username', 'email', 'actions'];
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly users = signal<UserListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<UserListSortBy>('firstName');
  protected readonly sortDirection = signal<UserListSortDirection>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasUsers = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(() => !this.hasUsers() && !!this.searchTerm());
  protected readonly showSearchbar = computed(() => this.hasUsers() || this.isEmptySearch());

  ngOnInit(): void {
    this.loadUsers();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadUsers();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as UserListSortBy) || 'firstName');
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadUsers();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  protected createOwner(): void {
    return;
  }

  protected editOwner(_user: UserListItem): void {
    return;
  }

  protected deleteOwner(_user: UserListItem): void {
    return;
  }

  private loadUsers(): void {
    this.userService
      .listOwners({
        searchTerm: this.searchTerm() || '',
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.users.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }
}
