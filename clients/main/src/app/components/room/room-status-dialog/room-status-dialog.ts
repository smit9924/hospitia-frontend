import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import {
  getRoomStatusOption,
  RoomStatusOption,
  roomStatusOptions,
} from '../../../data/room-status-options';
import { FloorLabelPipe } from '../../../pipes/floor-label/floor-label-pipe';
import { RoomStatus } from '../../../types/enums/room';
import { RoomFloorOverviewItem } from '../../../types/interfaces/room';

/** Data passed to the room status dialog. */
export interface RoomStatusDialogData {
  room: RoomFloorOverviewItem;
}

/**
 * Details of one room from the dashboard floor chart, with quick status
 * buttons. Closes with the chosen status (the caller saves it), or with
 * null when dismissed. "Edit room" opens the full room form.
 */
@Component({
  selector: 'app-room-status-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, RouterLink, FloorLabelPipe],
  templateUrl: './room-status-dialog.html',
  styleUrl: './room-status-dialog.scss',
})
export class RoomStatusDialog {
  private readonly dialogRef = inject(MatDialogRef<RoomStatusDialog, RoomStatus | null>);
  protected readonly room = inject<RoomStatusDialogData>(MAT_DIALOG_DATA).room;

  protected readonly statusOptions = roomStatusOptions;
  protected readonly currentStatus: RoomStatusOption = getRoomStatusOption(this.room.status);
  protected readonly editRoomRoute = appRoutes.createRoom;

  protected chooseStatus(status: RoomStatus): void {
    if (status === this.room.status) {
      return;
    }
    this.dialogRef.close(status);
  }

  protected close(): void {
    this.dialogRef.close(null);
  }
}
