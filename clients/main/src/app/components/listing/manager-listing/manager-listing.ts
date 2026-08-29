import { Component } from '@angular/core';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-manager-listing',
  imports: [SecondaryNavbar],
  templateUrl: './manager-listing.html',
  styleUrl: './manager-listing.scss',
})
export class ManagerListing {
  protected readonly titleText = $localize`Managers`;
}
