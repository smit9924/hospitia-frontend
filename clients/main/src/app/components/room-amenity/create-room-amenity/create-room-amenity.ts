import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Snackbar } from '../../../services/snackbar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { RoomAmenityForm } from '../room-amenity-form/room-amenity-form';

/** Page to create a room amenity, or edit one when the route has a `guid` query parameter. */
@Component({
  selector: 'app-create-room-amenity',
  imports: [SecondaryNavbar, MatCardModule, RoomAmenityForm],
  templateUrl: './create-room-amenity.html',
})
export class CreateRoomAmenity {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(Snackbar);

  /** GUID of the amenity to edit, from the `guid` query parameter; null when creating. */
  protected readonly amenityGuid = this.route.snapshot.queryParamMap.get('guid');
  protected readonly isEditMode = !!this.amenityGuid;
  protected readonly titleText = this.isEditMode
    ? $localize`Edit Room Amenity`
    : $localize`Create Room Amenity`;

  protected onAmenitySaved(): void {
    const text = this.isEditMode
      ? $localize`Room amenity updated successfully.`
      : $localize`Room amenity created successfully.`;
    this.snackbarService.open(
      new GenericSnackbarConfig({
        data: new GenericSnackbarConfigData({ text, type: GenericSnackbarType.SUCCESS }),
        duration: GenericSnackbarDuration.MEDIUM,
      }),
    );
    void this.router.navigateByUrl(appRoutes.roomAmenityListing);
  }
}
