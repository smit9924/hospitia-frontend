import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Organization } from '../../../services/organization/organization';
import { Profile } from '../../../services/profile';
import { SidebarNavigation } from '../../../services/sidebar-navigation/sidebar-navigation';
import { UserType } from '../../../types/enums/auth';
import { ResolvedSidebarNavigationLink } from '../../../types/interfaces/sidebar-navigation';
import { PageHeader } from '../../common/page-header/page-header';
import { RoomFloorChart } from '../../room/room-floor-chart/room-floor-chart';

/**
 * Dashboard content shared by every role: a greeting, the "Rooms by floor" chart for owners
 * and managers, and shortcut cards to the pages the signed-in user can open (the same links
 * as the sidebar, minus the dashboard itself).
 */
@Component({
  selector: 'app-dashboard-overview',
  imports: [MatIconModule, RouterLink, PageHeader, RoomFloorChart],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.scss',
})
export class DashboardOverview {
  private readonly profileService = inject(Profile);
  private readonly organizationService = inject(Organization);
  private readonly sidebarNavigationService = inject(SidebarNavigation);

  /** The floor chart shows the active organization's rooms, so only members see it. */
  protected readonly showsRoomFloorChart = computed(() => {
    const role = this.profileService.userProfile()?.role;
    return role === UserType.OWNER || role === UserType.MANAGER;
  });

  protected readonly greeting = computed(() => {
    const firstName = this.profileService.userProfile()?.firstName;
    return firstName ? $localize`Welcome back, ${firstName}` : $localize`Welcome back`;
  });

  protected readonly description = computed(() => {
    const organizationName = this.organizationService.activeOrganization()?.name;
    return organizationName
      ? $localize`Here is everything you can manage for ${organizationName}.`
      : $localize`Here is everything you can manage.`;
  });

  /** Shortcut cards: every page in the sidebar except the dashboard. */
  protected readonly shortcuts = computed((): ResolvedSidebarNavigationLink[] => [
    ...this.sidebarNavigationService
      .navigationGroups()
      .flatMap((group) => group.links)
      .filter((link) => !link.isActive),
    ...this.sidebarNavigationService.footerLinks(),
  ]);
}
