import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OrganizationReference, RoomAmenityListItem } from '../../../types/interfaces/room-amenity';
import { RoomAmenityForm } from '../room-amenity-form/room-amenity-form';

export interface RoomAmenityDialogData {
  /**
   * Organization the new amenity belongs to, for admins creating it from a
   * room type of that organization. Owners and managers leave it null: the
   * amenity belongs to their active organization.
   */
  organization: OrganizationReference | null;
}

/**
 * Dialog to create a room amenity without leaving the current form (e.g.
 * the room type form). Closes with the created amenity, or null when
 * cancelled.
 */
@Component({
  selector: 'app-room-amenity-dialog',
  imports: [MatDialogModule, RoomAmenityForm],
  templateUrl: './room-amenity-dialog.html',
})
export class RoomAmenityDialog {
  private readonly dialogRef = inject(MatDialogRef<RoomAmenityDialog, RoomAmenityListItem | null>);
  protected readonly data = inject<RoomAmenityDialogData>(MAT_DIALOG_DATA);

  protected onAmenitySaved(amenity: RoomAmenityListItem): void {
    this.dialogRef.close(amenity);
  }

  protected onCancel(): void {
    this.dialogRef.close(null);
  }
}
