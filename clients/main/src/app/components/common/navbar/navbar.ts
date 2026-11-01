import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

/**
 * Header of public pages (landing page, and error pages for signed-out visitors).
 * Signed-in pages use the app shell sidebar and top bar instead.
 */
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
  protected readonly authService = inject(Auth);
  private readonly profileService = inject(Profile);

  readonly loginLink = appRoutes.login;
  readonly signupLink = appRoutes.signup;
  /** The signed-in user's dashboard, for the "Go to dashboard" button. */
  readonly dashboardLink = signal(appRoutes.login);

  constructor() {
    effect(() => {
      this.profileService.userProfile();
      void this.profileService.getDefaultHomeRouteForUser().then((route) => {
        this.dashboardLink.set(route);
      });
    });
  }
}
