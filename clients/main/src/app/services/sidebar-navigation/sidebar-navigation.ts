import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { appRoutes } from '../../data/app-routes';
import { sidebarFooterLinks, sidebarNavigationGroups } from '../../data/sidebar-navigation';
import { UserType } from '../../types/enums/auth';
import { SidebarDynamicRoute } from '../../types/enums/navigation';
import {
  ResolvedSidebarNavigationGroup,
  ResolvedSidebarNavigationLink,
  SidebarNavigationLink,
} from '../../types/interfaces/sidebar-navigation';
import { Organization } from '../organization/organization';
import { Profile } from '../profile';

/**
 * Turns the static sidebar definition (data/sidebar-navigation.ts) into the links the
 * signed-in user may see, with routes resolved and the current page marked active.
 * Used by the sidebar and by the dashboard shortcuts.
 */
@Injectable({
  providedIn: 'root',
})
export class SidebarNavigation {
  private readonly router = inject(Router);
  private readonly profileService = inject(Profile);
  private readonly organizationService = inject(Organization);

  /** The role's dashboard route; resolved asynchronously by the profile service. */
  private readonly dashboardRoute = signal(appRoutes.login);

  /** Current URL without query string or fragment. */
  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.stripQueryAndFragment(event.urlAfterRedirects)),
    ),
    { initialValue: this.stripQueryAndFragment(this.router.url) },
  );

  private readonly currentRole = computed(() => this.profileService.userProfile()?.role ?? null);

  /** Sidebar groups for the signed-in user; groups without visible links are left out. */
  readonly navigationGroups = computed((): ResolvedSidebarNavigationGroup[] => {
    const role = this.currentRole();
    return sidebarNavigationGroups
      .map((group) => ({
        label: group.label,
        links: this.resolveLinksForRole(group.links, role),
      }))
      .filter((group) => group.links.length > 0);
  });

  /** Links pinned to the bottom of the sidebar. */
  readonly footerLinks = computed(() =>
    this.resolveLinksForRole(sidebarFooterLinks, this.currentRole()),
  );

  constructor() {
    effect(() => {
      // Re-resolve whenever the signed-in profile changes.
      this.profileService.userProfile();
      void this.profileService.getDefaultHomeRouteForUser().then((route) => {
        this.dashboardRoute.set(route);
      });
    });
  }

  private resolveLinksForRole(
    links: readonly SidebarNavigationLink[],
    role: UserType | null,
  ): ResolvedSidebarNavigationLink[] {
    if (role === null) {
      return [];
    }
    const currentPath = this.currentPath();
    return links
      .filter((link) => link.allowedRoles.includes(role))
      .map((link) => ({
        label: link.label,
        description: link.description,
        icon: link.icon,
        route: this.resolveRoute(link, role),
        isActive: link.activeRoutePrefixes.some((prefix) => currentPath.startsWith(prefix)),
      }));
  }

  private resolveRoute(link: SidebarNavigationLink, role: UserType): string {
    switch (link.dynamicRoute) {
      case SidebarDynamicRoute.DASHBOARD: {
        return this.dashboardRoute();
      }
      case SidebarDynamicRoute.ORGANIZATION_LISTING: {
        return this.organizationService.getDefaultOrganizationListingRouteForUser(role);
      }
      default: {
        return link.route ?? appRoutes.notFound;
      }
    }
  }

  private stripQueryAndFragment(url: string): string {
    return url.split(/[?#]/)[0];
  }
}
