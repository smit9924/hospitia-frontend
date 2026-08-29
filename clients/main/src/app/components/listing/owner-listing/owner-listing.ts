import { Component } from '@angular/core';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-owner-listing',
  imports: [SecondaryNavbar],
  templateUrl: './owner-listing.html',
  styleUrl: './owner-listing.scss',
})
export class OwnerListing {
  protected readonly titleText = $localize`Owners`;
}
