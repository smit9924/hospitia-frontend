import { UserType } from '../types/enums/auth';
import { SidebarDynamicRoute } from '../types/enums/navigation';
import {
  SidebarNavigationGroup,
  SidebarNavigationLink,
} from '../types/interfaces/sidebar-navigation';
import { appRoutes } from './app-routes';

const allRoles = [UserType.ADMIN, UserType.OWNER, UserType.MANAGER, UserType.CUSTOMER] as const;
const organizationMemberRoles = [UserType.ADMIN, UserType.OWNER, UserType.MANAGER] as const;

/**
 * Main sidebar navigation, grouped by job. Each role sees only the links it may open;
 * empty groups are hidden. Role visibility matches the route guards in app.routes.ts.
 */
export const sidebarNavigationGroups: readonly SidebarNavigationGroup[] = [
  {
    label: $localize`Overview`,
    links: [
      {
        label: $localize`Dashboard`,
        description: $localize`Your overview and shortcuts.`,
        icon: 'dashboard',
        dynamicRoute: SidebarDynamicRoute.DASHBOARD,
        allowedRoles: allRoles,
        activeRoutePrefixes: ['/dashboard'],
      },
    ],
  },
  {
    label: $localize`Property`,
    links: [
      {
        label: $localize`Room types`,
        description: $localize`Kinds of rooms you offer, with capacity and price.`,
        icon: 'bed',
        route: appRoutes.roomTypeListing,
        allowedRoles: organizationMemberRoles,
        activeRoutePrefixes: ['/organization/room-type'],
      },
      {
        label: $localize`Rooms`,
        description: $localize`Individual rooms with their number, floor and status.`,
        icon: 'meetingRoom',
        route: appRoutes.roomListing,
        allowedRoles: organizationMemberRoles,
        activeRoutePrefixes: ['/organization/room/'],
      },
      {
        label: $localize`Room amenities`,
        description: $localize`Facilities that room types can include.`,
        icon: 'roomService',
        route: appRoutes.roomAmenityListing,
        allowedRoles: organizationMemberRoles,
        activeRoutePrefixes: ['/organization/room-amenity'],
      },
    ],
  },
  {
    label: $localize`Organization`,
    links: [
      {
        label: $localize`Organizations`,
        description: $localize`Guest houses and their details.`,
        icon: 'apartment',
        dynamicRoute: SidebarDynamicRoute.ORGANIZATION_LISTING,
        allowedRoles: organizationMemberRoles,
        activeRoutePrefixes: [
          '/organization/listing',
          '/organization/create',
          '/organization/view',
        ],
      },
      {
        label: $localize`Organization types`,
        description: $localize`Categories used to classify organizations.`,
        icon: 'category',
        route: appRoutes.organizationTypeListing,
        allowedRoles: [UserType.ADMIN],
        activeRoutePrefixes: ['/organization/organization-type'],
      },
    ],
  },
  {
    label: $localize`People`,
    links: [
      {
        label: $localize`Admins`,
        description: $localize`People who manage the whole platform.`,
        icon: 'adminPanelSettings',
        route: appRoutes.adminListing,
        allowedRoles: [UserType.ADMIN],
        activeRoutePrefixes: [appRoutes.adminListing, appRoutes.createAdmin],
      },
      {
        label: $localize`Owners`,
        description: $localize`People who own organizations.`,
        icon: 'badge',
        route: appRoutes.ownerListing,
        allowedRoles: [UserType.ADMIN],
        activeRoutePrefixes: [appRoutes.ownerListing, appRoutes.createOwner],
      },
      {
        label: $localize`Managers`,
        description: $localize`People who run an organization day to day.`,
        icon: 'groups',
        route: appRoutes.managerListing,
        allowedRoles: [UserType.ADMIN, UserType.OWNER],
        activeRoutePrefixes: [appRoutes.managerListing, appRoutes.createManager],
      },
      {
        label: $localize`Customers`,
        description: $localize`Guests registered with your organization.`,
        icon: 'group',
        route: appRoutes.customerListing,
        allowedRoles: organizationMemberRoles,
        activeRoutePrefixes: [appRoutes.customerListing, appRoutes.createCustomer],
      },
    ],
  },
  {
    label: $localize`System`,
    links: [
      {
        label: $localize`Currency units`,
        description: $localize`Currencies available for room prices.`,
        icon: 'currencyExchange',
        route: appRoutes.currencyUnitListing,
        allowedRoles: [UserType.ADMIN],
        activeRoutePrefixes: ['/currency-unit'],
      },
    ],
  },
];

/** Links pinned to the bottom of the sidebar. */
export const sidebarFooterLinks: readonly SidebarNavigationLink[] = [
  {
    label: $localize`Settings`,
    description: $localize`Profile, password and display preferences.`,
    icon: 'settings',
    route: appRoutes.settings,
    allowedRoles: allRoles,
    activeRoutePrefixes: [appRoutes.settings, appRoutes.profile],
  },
];
