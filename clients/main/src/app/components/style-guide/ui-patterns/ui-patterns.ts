import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { PageHeader } from '../../common/page-header/page-header';

/** Example row for the listing table preview. */
interface ExampleRoomType {
  name: string;
  capacity: number;
  costPerNight: string;
  isBookable: boolean;
}

/**
 * Style guide section showing the shared page patterns from styles/_page-patterns.scss and
 * styles/_app-shell.scss, so new screens reuse them instead of adding component styles.
 */
@Component({
  selector: 'app-ui-patterns',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    PageHeader,
  ],
  templateUrl: './ui-patterns.html',
  styleUrl: './ui-patterns.scss',
})
export class UiPatterns {
  protected readonly exampleColumns = ['name', 'capacity', 'costPerNight', 'status'];
  protected readonly exampleRoomTypes: ExampleRoomType[] = [
    { name: 'Deluxe double', capacity: 2, costPerNight: 'INR 1,400.00', isBookable: true },
    { name: 'Family suite', capacity: 4, costPerNight: 'INR 4,000.00', isBookable: false },
  ];
  protected readonly exampleAmenities = ['Wi-Fi', 'Air conditioning', 'Geyser', 'Balcony'];
}
