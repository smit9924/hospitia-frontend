import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { appRoutes } from '../../../data/app-routes';
import {
  getRoomStatusOption,
  RoomStatusOption,
  roomStatusOptions,
} from '../../../data/room-status-options';
import { formatFloorLabel } from '../../../pipes/floor-label/floor-label-pipe';
import { Organization } from '../../../services/organization/organization';
import { Room } from '../../../services/room/room';
import { Snackbar } from '../../../services/snackbar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { RoomStatus } from '../../../types/enums/room';
import { RoomFloorOverviewItem } from '../../../types/interfaces/room';
import { RoomTypeOption } from '../../../types/interfaces/room-type';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { RoomStatusDialog, RoomStatusDialogData } from '../room-status-dialog/room-status-dialog';

/** One building floor of the chart with its (filtered) rooms. */
interface RoomFloorRow {
  floor: number;
  label: string;
  rooms: RoomFloorOverviewItem[];
  availableCount: number;
  /** True for the first basement row below above-ground rows (draws the ground line). */
  startsBelowGround: boolean;
}

/** Count tile for one status (or the total). */
interface RoomStatusCount {
  label: string;
  icon: string;
  count: number;
  /** Share of the shown rooms, 0-100, rounded. */
  percent: number;
  tileClass: string;
}

/** Room type filter value meaning "every room type". */
const ALL_ROOM_TYPES = '';

/** How long the Undo action stays available after a status change. */
const UNDO_WINDOW = GenericSnackbarDuration.MEDIUM;

/**
 * Dashboard "Rooms by floor" chart for owners and managers.
 *
 * Draws the active organization's rooms as a building cross-section: one
 * row per floor (top floor first, basements below a ground line), each room
 * a status-colored tile. Count tiles and a distribution bar summarize the
 * statuses, a room type filter narrows the chart, and selecting a room
 * opens a dialog to change its status at once (with Undo).
 */
@Component({
  selector: 'app-room-floor-chart',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './room-floor-chart.html',
  styleUrl: './room-floor-chart.scss',
})
export class RoomFloorChart {
  private readonly roomService = inject(Room);
  private readonly organizationService = inject(Organization);
  private readonly matDialog = inject(MatDialog);
  private readonly snackbarService = inject(Snackbar);

  protected readonly allRoomTypes = ALL_ROOM_TYPES;
  protected readonly statusOptions = roomStatusOptions;
  protected readonly createRoomRoute = appRoutes.createRoom;

  protected readonly rooms = signal<RoomFloorOverviewItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasLoadError = signal(false);
  /** GUIDs of rooms whose status is being saved (their tiles are disabled). */
  protected readonly savingRoomGuids = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedRoomTypeGuid = signal(ALL_ROOM_TYPES);

  /** Room types that have at least one room, sorted by name, for the filter. */
  protected readonly roomTypeFilterOptions = computed((): RoomTypeOption[] => {
    const roomTypesByGuid = new Map(
      this.rooms().map((room) => [room.roomType.guid, room.roomType]),
    );
    return [...roomTypesByGuid.values()].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  });

  /** Rooms matching the room type filter, in the API order (top floor first). */
  protected readonly visibleRooms = computed(() => {
    const roomTypeGuid = this.selectedRoomTypeGuid();
    return roomTypeGuid === ALL_ROOM_TYPES
      ? this.rooms()
      : this.rooms().filter((room) => room.roomType.guid === roomTypeGuid);
  });

  /** Total and per-status count tiles for the shown rooms. */
  protected readonly statusCounts = computed((): RoomStatusCount[] => {
    const rooms = this.visibleRooms();
    const percentOf = (count: number) =>
      rooms.length === 0 ? 0 : Math.round((count / rooms.length) * 100);
    return [
      {
        label: $localize`Total rooms`,
        icon: 'meetingRoom',
        count: rooms.length,
        percent: rooms.length === 0 ? 0 : 100,
        tileClass: 'status-count-tile--total',
      },
      ...roomStatusOptions.map((option) => {
        const count = rooms.filter((room) => room.status === option.value).length;
        return {
          label: option.label,
          icon: option.icon,
          count,
          percent: percentOf(count),
          tileClass: option.tileClass,
        };
      }),
    ];
  });

  /** Floor rows of the shown rooms, top floor first. */
  protected readonly floorRows = computed((): RoomFloorRow[] => {
    const rows: RoomFloorRow[] = [];
    for (const room of this.visibleRooms()) {
      const lastRow = rows.at(-1);
      if (lastRow?.floor === room.floor) {
        lastRow.rooms.push(room);
      } else {
        rows.push({
          floor: room.floor,
          label: this.floorRowLabel(room.floor),
          rooms: [room],
          availableCount: 0,
          startsBelowGround: false,
        });
      }
    }
    rows.forEach((row, index) => {
      row.availableCount = row.rooms.filter((room) => room.status === RoomStatus.AVAILABLE).length;
      row.startsBelowGround = row.floor < 0 && index > 0 && rows[index - 1].floor >= 0;
    });
    return rows;
  });

  constructor() {
    // Load on start and again whenever the active organization changes.
    const activeOrganizationGuid = computed(
      () => this.organizationService.activeOrganization()?.guid,
    );
    effect(() => {
      activeOrganizationGuid();
      untracked(() => this.loadRooms());
    });
  }

  protected statusOption(status: RoomStatus): RoomStatusOption {
    return getRoomStatusOption(status);
  }

  protected isSaving(room: RoomFloorOverviewItem): boolean {
    return this.savingRoomGuids().has(room.guid);
  }

  /** Accessible name of a tile, e.g. "Room 201, Deluxe double, Available". */
  protected tileLabel(room: RoomFloorOverviewItem): string {
    return $localize`Room ${room.roomNumber}, ${room.roomType.name}, ${this.statusOption(room.status).label}`;
  }

  protected floorRowAriaLabel(row: RoomFloorRow): string {
    return $localize`${row.label}, ${row.rooms.length} rooms, ${row.availableCount} available`;
  }

  protected onRoomTypeFilterChange(roomTypeGuid: string): void {
    this.selectedRoomTypeGuid.set(roomTypeGuid);
  }

  /** Opens the room's details; a chosen status is saved right away. */
  protected openRoom(room: RoomFloorOverviewItem): void {
    this.matDialog
      .open<RoomStatusDialog, RoomStatusDialogData, RoomStatus | null>(RoomStatusDialog, {
        data: { room },
        width: '480px',
        maxWidth: '95vw',
        panelClass: 'full-screen-dialog-mobile',
      })
      .afterClosed()
      .pipe(filter((status): status is RoomStatus => !!status))
      .subscribe((status) => this.changeStatus(room, status, { offerUndo: true }));
  }

  protected loadRooms(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);
    this.roomService.getFloorOverview().subscribe({
      next: (response) => {
        this.rooms.set(response.rooms);
        const isFilterStillOffered = response.rooms.some(
          (room) => room.roomType.guid === this.selectedRoomTypeGuid(),
        );
        if (!isFilterStillOffered) {
          this.selectedRoomTypeGuid.set(ALL_ROOM_TYPES);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.hasLoadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Saves a new status for the room and updates the tile and counts when the
   * backend confirms it. The first change offers Undo, which saves the
   * previous status the same way.
   */
  private changeStatus(
    room: RoomFloorOverviewItem,
    status: RoomStatus,
    { offerUndo }: { offerUndo: boolean },
  ): void {
    const previousStatus = this.currentStatusOf(room.guid) ?? room.status;
    this.setSaving(room.guid, true);
    this.roomService.updateStatus({ guid: room.guid, status }).subscribe({
      next: (updatedRoom) => {
        this.setSaving(room.guid, false);
        this.rooms.update((rooms) =>
          rooms.map((item) =>
            item.guid === room.guid ? { ...item, status: updatedRoom.status } : item,
          ),
        );
        const statusLabel = this.statusOption(updatedRoom.status).label;
        if (offerUndo) {
          this.showSnackbar(
            $localize`Room ${room.roomNumber} is now ${statusLabel}.`,
            GenericSnackbarType.SUCCESS,
            () => this.changeStatus(room, previousStatus, { offerUndo: false }),
          );
        } else {
          this.showSnackbar(
            $localize`Room ${room.roomNumber} is back to ${statusLabel}.`,
            GenericSnackbarType.SUCCESS,
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this.setSaving(room.guid, false);
        if (error.status === HttpStatusCode.NotFound) {
          this.showSnackbar(
            $localize`Room ${room.roomNumber} no longer exists.`,
            GenericSnackbarType.ERROR,
          );
          this.loadRooms();
          return;
        }
        this.showSnackbar(
          $localize`Room ${room.roomNumber} could not be updated. Please try again.`,
          GenericSnackbarType.ERROR,
        );
      },
    });
  }

  private currentStatusOf(roomGuid: string): RoomStatus | undefined {
    return this.rooms().find((room) => room.guid === roomGuid)?.status;
  }

  private setSaving(roomGuid: string, isSaving: boolean): void {
    this.savingRoomGuids.update((saving) => {
      const updated = new Set(saving);
      if (isSaving) {
        updated.add(roomGuid);
      } else {
        updated.delete(roomGuid);
      }
      return updated;
    });
  }

  /** "Floor 2" for upper floors, "Ground" and "B1" otherwise. */
  private floorRowLabel(floor: number): string {
    return floor > 0 ? $localize`Floor ${floor}` : formatFloorLabel(floor);
  }

  private showSnackbar(text: string, type: GenericSnackbarType, onUndo?: () => void): void {
    this.snackbarService.open(
      new GenericSnackbarConfig({
        data: new GenericSnackbarConfigData({
          text,
          type,
          actionLabel: onUndo ? $localize`Undo` : '',
          onAction: onUndo,
        }),
        duration: onUndo ? UNDO_WINDOW : GenericSnackbarDuration.MEDIUM,
      }),
    );
  }
}
