/** Sidebar links whose target depends on the signed-in user and is resolved at runtime. */
export enum SidebarDynamicRoute {
  /** The role's dashboard (see Profile.getDefaultHomeRouteForUser). */
  DASHBOARD = 'dashboard',
  /** The role's organization listing (see Organization.getDefaultOrganizationListingRouteForUser). */
  ORGANIZATION_LISTING = 'organizationListing',
}
