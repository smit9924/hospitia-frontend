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
import { getRoomStatusOption, RoomStatusOption } from '../../../data/room-status-options';
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { FloorLabelPipe } from '../../../pipes/floor-label/floor-label-pipe';
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { Room } from '../../../services/room/room';
import { Snackbar } from '../../../services/snackbar';
import { UserType } from '../../../types/enums/auth';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import { RoomStatus } from '../../../types/enums/room';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { RoomListItem, RoomSortBy } from '../../../types/interfaces/room';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { PageHeader } from '../../common/page-header/page-header';
import { Searchbar } from '../../common/searchbar/searchbar';

const DEFAULT_SORT_BY: RoomSortBy = 'roomNumber';

/**
 * Listing of rooms, searchable by room number. Owners and managers see
 * their active organization's rooms; admins see every organization's, with
 * an organization column.
 */
@Component({
  selector: 'app-room-listing',
  imports: [
    PageHeader,
    Searchbar,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    CustomMatTooltip,
    FloorLabelPipe,
  ],
  templateUrl: './room-listing.html',
  styleUrl: './room-listing.scss',
})
export class RoomListing implements OnInit {
  private readonly roomService = inject(Room);
  private readonly profileService = inject(Profile);
  private readonly router = inject(Router);
  private readonly dialogService = inject(Dialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly titleText = $localize`Rooms`;
  protected readonly pageSizeOptions = [5, 10, 25, 50];

  protected readonly isAdmin = computed(
    () => this.profileService.userProfile()?.role === UserType.ADMIN,
  );
  /** The organization column only matters to admins, who see every organization. */
  protected readonly displayedColumns = computed(() => {
    const columns = ['roomNumber', 'floor', 'roomType', 'status'];
    return this.isAdmin() ? [...columns, 'organization', 'actions'] : [...columns, 'actions'];
  });

  protected readonly rooms = signal<RoomListItem[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly sortBy = signal<RoomSortBy>(DEFAULT_SORT_BY);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly searchTerm = signal('');
  protected readonly isInitialLoad = signal(true);
  protected readonly hasRooms = computed(() => this.totalCount() > 0);
  protected readonly isEmptySearch = computed(() => !this.hasRooms() && !!this.searchTerm());
  protected readonly showSearchbar = computed(() => this.hasRooms() || this.isEmptySearch());

  ngOnInit(): void {
    this.loadRooms();
  }

  /** Label and chip class of the room's status. */
  protected statusOption(status: RoomStatus): RoomStatusOption {
    return getRoomStatusOption(status);
  }

  protected getActionsMenuLabel(room: RoomListItem): string {
    return $localize`Actions for room ${room.roomNumber}`;
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
    this.loadRooms();
  }

  protected onSortChange(sort: Sort): void {
    this.sortBy.set((sort.active as RoomSortBy) || DEFAULT_SORT_BY);
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.pageIndex.set(0);
    this.loadRooms();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRooms();
  }

  protected createRoom(): void {
    void this.router.navigateByUrl(appRoutes.createRoom);
  }

  protected editRoom(room: RoomListItem): void {
    void this.router.navigate([appRoutes.createRoom], { queryParams: { guid: room.guid } });
  }

  protected deleteRoom(room: RoomListItem): void {
    this.dialogService
      .openConfirmDialog(
        $localize`Delete Room`,
        $localize`Are you sure you want to delete room "${room.roomNumber}"?`,
      )
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.roomService.delete(room.guid)),
      )
      .subscribe({
        next: () => {
          this.showSnackbar($localize`Room deleted successfully.`, GenericSnackbarType.SUCCESS);
          this.loadRooms();
        },
        error: (error: HttpErrorResponse) => {
          const errorCode = (error.error as ApiErrorResponse<unknown> | null)?.errorCode;
          this.showSnackbar(
            errorCode === ErrorCodes.ROOM_NOT_FOUND
              ? $localize`This room was already deleted.`
              : $localize`Failed to delete room. Please try again.`,
            GenericSnackbarType.ERROR,
          );
          // The row may already be gone or have changed elsewhere; keep the table consistent.
          this.loadRooms();
        },
      });
  }

  private loadRooms(): void {
    this.roomService
      .list({
        searchTerm: this.searchTerm(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        pageNumber: this.pageIndex() + 1,
      })
      .pipe(finalize(() => this.isInitialLoad.set(false)))
      .subscribe((response) => {
        this.rooms.set(response.items);
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
