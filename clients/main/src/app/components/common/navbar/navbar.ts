import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { appRoutes } from '../../../data/app-routes';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    NgOptimizedImage,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private authService = inject(Auth);

  get dashboardLink(): string {
    return appRoutes.adminDashboard;
  }

  logout(): void {
    this.authService.logout();
  }
}
