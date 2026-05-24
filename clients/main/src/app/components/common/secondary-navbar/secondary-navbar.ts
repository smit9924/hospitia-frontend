import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-secondary-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './secondary-navbar.html',
  styleUrl: './secondary-navbar.scss',
})
export class SecondaryNavbar {
  @Input() title = '';
  @Input() backButton = false;
  location = inject(Location);

  back(): void {
    this.location.back();
  }
}
