import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CustomMatTooltip } from '../../../directives/custom-mat-tooltip/custom-mat-tooltip';
import { Organization } from '../../../services/organization/organization';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { SidebarNavigation } from '../../../services/sidebar-navigation/sidebar-navigation';

/**
 * Content of the app sidebar: logo, active organization and the grouped links
 * for the signed-in user's role.
 */
@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, MatIconModule, MatTooltipModule, RouterLink, CustomMatTooltip],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.scss',
})
export class AppSidebar {
  protected readonly sidebarService = inject(Sidebar);
  protected readonly sidebarNavigationService = inject(SidebarNavigation);
  private readonly organizationService = inject(Organization);

  /** Set for owners and managers once their active organization is resolved. */
  protected readonly activeOrganization = this.organizationService.activeOrganization;

  /** Up to two initials of the active organization, e.g. "SG" for "Sunrise Guest House". */
  protected readonly activeOrganizationInitials = computed(() =>
    (this.activeOrganization()?.name ?? '')
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  );

  /** On tablet and phone the drawer closes once a page is chosen. */
  protected onLinkSelected(): void {
    this.sidebarService.closeDrawer();
  }
}
