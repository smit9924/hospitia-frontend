import { Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Heading of a routed page: optional back button, the page title (the page's `<h1>`),
 * an optional one-line description and the page's actions on the right.
 *
 * Actions are projected: `<app-page-header titleText="Room types"><button pageHeaderActions>…`.
 */
@Component({
  selector: 'app-page-header',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  private readonly location = inject(Location);

  readonly titleText = input('');
  readonly description = input('');
  readonly backButton = input(false);

  protected back(): void {
    this.location.back();
  }
}
