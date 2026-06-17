import { NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { appRoutes } from '../../../data/app-routes';
import { Router, RouterLink } from '@angular/router';
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
export class Navbar implements AfterViewInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    this.exposePrimaryNavbarHeight();
  }

  get dashboardLink(): string {
    return appRoutes.adminDashboard;
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
