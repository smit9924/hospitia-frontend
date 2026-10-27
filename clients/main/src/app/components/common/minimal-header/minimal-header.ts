import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../../services/auth';

/** Brand and log out only, for blocking pages shown before the main app is available. */
@Component({
  selector: 'app-minimal-header',
  imports: [NgOptimizedImage, MatButtonModule],
  templateUrl: './minimal-header.html',
  styleUrl: './minimal-header.scss',
})
export class MinimalHeader {
  private readonly authService = inject(Auth);

  protected logout(): void {
    this.authService.logout();
  }
}
