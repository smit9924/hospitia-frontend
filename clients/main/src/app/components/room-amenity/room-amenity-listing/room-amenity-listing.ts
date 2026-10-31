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
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { RoomAmenity } from '../../../services/room-amenity/room-amenity';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { RoomAmenityListItem, RoomAmenitySortBy } from '../../../types/interfaces/room-amenity';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

const DEFAULT_SORT_BY: RoomAmenitySortBy = 'name';

/**
 * Listing of room amenities. Admins see every amenity with its
 * organization; owners and managers see the defaults plus their active
 * organization's custom amenities, and can change only the custom ones.
 */
@Component({
  selector: 'app-room-amenity-listing',
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
  templateUrl: './room-amenity-listing.html',
  styleUrl: './room-amenity-listing.scss',
})
export class RoomAmenityListing implements OnInit {
  private readonly roomAmenityService = inject(RoomAmenity);
  private readonly profileService = inject(Profile);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Room Amenities`;
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );
  /** The organization column only matters to admins, who see every organization. */
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['name', 'description', 'availability', 'organization', 'actions']
      : ['name', 'description', 'availability', 'actions'],
  );

  protected readonly roomAmenities = signal<RoomAmenityListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<RoomAmenitySortBy>(DEFAULT_SORT_BY);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasRoomAmenities = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(
    () => !this.hasRoomAmenities() && !!this.searchTerm(),
  );
  protected readonly showSearchbar = computed(
    () => this.hasRoomAmenities() || this.isEmptySearch(),
  );

  ngOnInit(): void {
    this.loadRoomAmenities();
  }

  /** Admins change any amenity; owners and managers only their organization's custom ones. */
  protected canModify(roomAmenity: RoomAmenityListItem): boolean {
    return this.isAdmin() || !roomAmenity.isDefault;
  }

  protected getActionsMenuLabel(roomAmenity: RoomAmenityListItem): string {
    return $localize`Actions for ${roomAmenity.name}`;
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadRoomAmenities();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as RoomAmenitySortBy) || DEFAULT_SORT_BY);
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadRoomAmenities();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRoomAmenities();
  }

  protected createRoomAmenity(): void {
    void this.router.navigateByUrl(appRoutes.createRoomAmenity);
  }

  protected editRoomAmenity(roomAmenity: RoomAmenityListItem): void {
    void this.router.navigate([appRoutes.createRoomAmenity], {
      queryParams: { guid: roomAmenity.guid },
    });
  }

  protected deleteRoomAmenity(roomAmenity: RoomAmenityListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Room Amenity`,
        $localize`Are you sure you want to delete "${roomAmenity.name}"?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.roomAmenityService.delete(roomAmenity.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar(
            $localize`Room amenity deleted successfully.`,
            GenericSnackbarType.SUCCESS,
          );
          this.loadRoomAmenities();
        },
        error: (error: HttpErrorResponse) => {
          this.showSnackbar(this.getDeleteErrorMessage(error), GenericSnackbarType.ERROR);
          // Refresh on error too: the row may already be gone, or state may
          // have changed from another session — keep the table consistent.
          this.loadRoomAmenities();
        },
      });
  }

  private getDeleteErrorMessage(error: HttpErrorResponse): string {
    const errorCode = (error.error as ApiErrorResponse<unknown> | null)?.errorCode;
    if (errorCode === ErrorCodes.ROOM_AMENITY_NOT_FOUND) {
      return $localize`This room amenity was already deleted.`;
    }
    if (errorCode === ErrorCodes.ROOM_AMENITY_IN_USE) {
      return $localize`This room amenity is used by a room type and cannot be deleted.`;
    }
    if (errorCode === ErrorCodes.ROOM_AMENITY_MODIFICATION_FORBIDDEN) {
      return $localize`Only admins can delete default room amenities.`;
    }
    return $localize`Failed to delete room amenity. Please try again.`;
  }

  private loadRoomAmenities(): void {
    this.roomAmenityService
      .list({
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.roomAmenities.set(response.items);
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
