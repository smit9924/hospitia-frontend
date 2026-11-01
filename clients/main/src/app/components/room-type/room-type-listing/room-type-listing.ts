import { DecimalPipe } from '@angular/common';
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
import { RoomType } from '../../../services/room-type/room-type';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { RoomTypeListItem, RoomTypeSortBy } from '../../../types/interfaces/room-type';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { Searchbar } from '../../common/searchbar/searchbar';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

const DEFAULT_SORT_BY: RoomTypeSortBy = 'name';

/**
 * Listing of room types. Owners and managers see their active
 * organization's room types; admins see every organization's, with an
 * organization column.
 */
@Component({
  selector: 'app-room-type-listing',
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
    DecimalPipe,
  ],
  templateUrl: './room-type-listing.html',
  styleUrl: './room-type-listing.scss',
})
export class RoomTypeListing implements OnInit {
  private readonly roomTypeService = inject(RoomType);
  private readonly profileService = inject(Profile);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Room Types`;
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );
  /** The organization column only matters to admins, who see every organization. */
  protected readonly displayedColumns = computed(() => {
    const columns = ['name', 'capacity', 'costPerNight', 'amenities'];
    return this.isAdmin() ? [...columns, 'organization', 'actions'] : [...columns, 'actions'];
  });

  protected readonly roomTypes = signal<RoomTypeListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<RoomTypeSortBy>(DEFAULT_SORT_BY);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasRoomTypes = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(() => !this.hasRoomTypes() && !!this.searchTerm());
  protected readonly showSearchbar = computed(() => this.hasRoomTypes() || this.isEmptySearch());

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  /** Amenity names as one line, e.g. "Geyser, TV"; a dash when there are none. */
  protected formatAmenities(roomType: RoomTypeListItem): string {
    return roomType.amenities.map((amenity) => amenity.name).join(', ') || '-';
  }

  /** The API sends money as a decimal string; the number is only used for display. */
  protected toAmount(costPerNight: string): number {
    return Number(costPerNight);
  }

  protected getActionsMenuLabel(roomType: RoomTypeListItem): string {
    return $localize`Actions for ${roomType.name}`;
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadRoomTypes();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as RoomTypeSortBy) || DEFAULT_SORT_BY);
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadRoomTypes();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRoomTypes();
  }

  protected createRoomType(): void {
    void this.router.navigateByUrl(appRoutes.createRoomType);
  }

  protected editRoomType(roomType: RoomTypeListItem): void {
    void this.router.navigate([appRoutes.createRoomType], {
      queryParams: { guid: roomType.guid },
    });
  }

  protected deleteRoomType(roomType: RoomTypeListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Room Type`,
        $localize`Are you sure you want to delete "${roomType.name}"?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.roomTypeService.delete(roomType.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar(
            $localize`Room type deleted successfully.`,
            GenericSnackbarType.SUCCESS,
          );
          this.loadRoomTypes();
        },
        error: (error: HttpErrorResponse) => {
          const errorCode = (error.error as ApiErrorResponse<unknown> | null)?.errorCode;
          this.showSnackbar(
            errorCode === ErrorCodes.ROOM_TYPE_NOT_FOUND
              ? $localize`This room type was already deleted.`
              : $localize`Failed to delete room type. Please try again.`,
            GenericSnackbarType.ERROR,
          );
          // Refresh on error too: the row may already be gone, or state may
          // have changed from another session — keep the table consistent.
          this.loadRoomTypes();
        },
      });
  }

  private loadRoomTypes(): void {
    this.roomTypeService
      .list({
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.roomTypes.set(response.items);
        this.totalCount.set(response.totalCount);
      });
  }

  private showSnackbar(text: string, type: GenericSnackbarType): void {
    this.snackbarService.open(
      new GenericSnackbarConfig({
        data: new GenericSnackbarConfigData({ text, type }),
        duration: GenericSnackbarDuration.MEDIUM,
      }),
    );
  }
}
