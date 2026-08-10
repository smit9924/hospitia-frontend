import { NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, effect, ElementRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { appRoutes } from '../../../data/app-routes';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

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
export class Navbar implements AfterViewInit {
  protected readonly authService = inject(Auth);
  protected readonly profileService = inject(Profile);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  readonly loginLink = appRoutes.login;
  readonly signupLink = appRoutes.signup;
  readonly dashboardLink = signal(appRoutes.login);

  constructor() {
    effect(() => {
      this.profileService.userProfile();
      void this.profileService.getDefaultHomeRouteForUser().then((route) => {
        this.dashboardLink.set(route);
      });
    });
  }

  ngAfterViewInit(): void {
    this.exposePrimaryNavbarHeight();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigateByUrl(appRoutes.profile);
  }

  navigateToSettings(): void {
    this.router.navigateByUrl(appRoutes.settings);
  }

  private exposePrimaryNavbarHeight(): void {
    const primaryNavElement = this.elementRef?.nativeElement;

    if (primaryNavElement) {
      const height = primaryNavElement.offsetHeight;
      document.documentElement.style.setProperty('--primary-navbar-height', `${height}px`);
    }
  }
}
