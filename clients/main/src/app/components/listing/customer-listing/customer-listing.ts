import { Component } from '@angular/core';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';

@Component({
  selector: 'app-customer-listing',
  imports: [SecondaryNavbar],
  templateUrl: './customer-listing.html',
  styleUrl: './customer-listing.scss',
})
export class CustomerListing {
  protected readonly titleText = $localize`Customers`;
}
