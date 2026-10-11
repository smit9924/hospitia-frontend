import { NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';
import { Organization } from '../../../services/organization/organization';
import { UserType } from '../../../types/enums/auth';

interface UsersMenuLink {
  label: string;
  route: string;
}

type OrganizationMenuLinkFactory = (organizationService: Organization) => UsersMenuLink[];

const organizationMenuLinksByRole: Partial<Record<UserType, OrganizationMenuLinkFactory>> = {
  [UserType.ADMIN]: (organizationService) => [
    {
      label: $localize`Organizations`,
      route: organizationService.getDefaultOrganizationListingRouteForUser(UserType.ADMIN),
    },
    { label: $localize`Organization Type`, route: appRoutes.organizationTypeListing },
  ],
  [UserType.OWNER]: (organizationService) => [
    {
      label: $localize`Organizations`,
      route: organizationService.getDefaultOrganizationListingRouteForUser(UserType.OWNER),
    },
  ],
  [UserType.MANAGER]: (organizationService) => [
    {
      label: $localize`Organizations`,
      route: organizationService.getDefaultOrganizationListingRouteForUser(UserType.MANAGER),
    },
  ],
};

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
  private readonly organizationService = inject(Organization);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  readonly loginLink = appRoutes.login;
  readonly signupLink = appRoutes.signup;
  readonly dashboardLink = signal(appRoutes.login);

  protected readonly usersMenuLinks = computed((): UsersMenuLink[] => {
    const role = this.profileService.userProfile()?.role;

    if (role === UserType.ADMIN) {
      return [
        { label: $localize`Admin`, route: appRoutes.adminListing },
        { label: $localize`Owner`, route: appRoutes.ownerListing },
        { label: $localize`Manager`, route: appRoutes.managerListing },
        { label: $localize`Customer`, route: appRoutes.customerListing },
      ];
    }

    if (role === UserType.OWNER) {
      return [
        { label: $localize`Manager`, route: appRoutes.managerListing },
        { label: $localize`Customer`, route: appRoutes.customerListing },
      ];
    }

    if (role === UserType.MANAGER) {
      return [{ label: $localize`Customer`, route: appRoutes.customerListing }];
    }

    return [];
  });

  protected readonly showUsersMenu = computed(() => this.usersMenuLinks().length > 0);

  protected readonly organizationMenuLinks = computed((): UsersMenuLink[] => {
    const role = this.profileService.userProfile()?.role ?? UserType.CUSTOMER;
    return organizationMenuLinksByRole[role]?.(this.organizationService) ?? [];
  });

  protected readonly showOrganizationMenu = computed(() => this.organizationMenuLinks().length > 0);

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
