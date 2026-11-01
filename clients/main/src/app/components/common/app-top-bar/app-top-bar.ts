import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { DisplayAndAccessibility } from '../../../services/display-and-accessibility/display-and-accessibility';
import { Profile } from '../../../services/profile';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { ThemePreference, ThemeType } from '../../../types/enums/common';

/** Top bar of the app shell: sidebar toggle, theme switch and the profile menu. */
@Component({
  selector: 'app-top-bar',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './app-top-bar.html',
  styleUrl: './app-top-bar.scss',
})
export class AppTopBar {
  protected readonly sidebarService = inject(Sidebar);
  private readonly authService = inject(Auth);
  private readonly profileService = inject(Profile);
  private readonly displayAndAccessibilityService = inject(DisplayAndAccessibility);
  private readonly router = inject(Router);

  protected readonly userProfile = this.profileService.userProfile;

  protected readonly isDarkThemeActive = computed(
    () => this.displayAndAccessibilityService.activeTheme() === ThemeType.DARK,
  );

  protected readonly themeToggleLabel = computed(() =>
    this.isDarkThemeActive() ? $localize`Switch to light theme` : $localize`Switch to dark theme`,
  );

  /** Menu icon on tablet/phone; panel icon that reflects the rail state on wide screens. */
  protected readonly navigationToggleIcon = computed(() => {
    if (this.sidebarService.isCompactViewport()) {
      return 'menu';
    }
    return this.sidebarService.isCollapsedToRail() ? 'leftPanelOpen' : 'leftPanelClose';
  });

  protected readonly userDisplayName = computed(() => {
    const profile = this.userProfile();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
    return fullName || profile?.username || profile?.email || '';
  });

  /** Up to two initials shown in the avatar button. */
  protected readonly userInitials = computed(() =>
    this.userDisplayName()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  );

  protected toggleNavigation(): void {
    this.sidebarService.toggle();
  }

  protected toggleTheme(): void {
    this.displayAndAccessibilityService.setTheme(
      this.isDarkThemeActive() ? ThemePreference.LIGHT : ThemePreference.DARK,
    );
  }

  protected navigateToProfile(): void {
    void this.router.navigateByUrl(appRoutes.profile);
  }

  protected navigateToSettings(): void {
    void this.router.navigateByUrl(appRoutes.settings);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
