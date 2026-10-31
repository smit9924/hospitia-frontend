export const appRoutes = {
  // Auth
  login: '/auth/login',
  signup: '/auth/signup',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  // *** End Auth ***

  // Dashboards
  adminDashboard: '/dashboard/admin',
  ownerDashboard: '/dashboard/owner',
  managerDashboard: '/dashboard/manager',
  customerDashboard: '/dashboard/customer',
  // *** End Dashboards ***

  // Error Pages
  permissionDeny: '/error/403',
  notFound: '/error/404',
  accountSetupFailed: '/error/account-setup',
  // *** End Error Pages ***

  // Settings
  settings: '/settings',
  displaySettings: '/settings/display-and-accessibility',
  changePassword: '/settings/change-password',
  privacySettings: '/settings/privacy',
  // *** End Settings ***

  profile: '/profile',

  // Users listing
  adminListing: '/users/admins',
  ownerListing: '/users/owners',
  managerListing: '/users/managers',
  customerListing: '/users/customers',
  // *** End Users listing ***

  // User creation
  createAdmin: '/users/create/admin',
  createOwner: '/users/create/owner',
  createManager: '/users/create/manager',
  createCustomer: '/users/create/customer',
  // *** End User creation ***

  // Organization
  organizationTypeListing: '/organization/organization-type/listing',
  createOrganizationType: '/organization/organization-type/create',
  organizationListingAdmin: '/organization/listing/admin',
  organizationListingOwner: '/organization/listing/owner',
  organizationListingManager: '/organization/listing/manager',
  createOrganizationAdmin: '/organization/create/admin',
  createOrganizationOwner: '/organization/create/owner',
  viewOrganization: '/organization/view',
  roomAmenityListing: '/organization/room-amenity/listing',
  createRoomAmenity: '/organization/room-amenity/create',
  // *** End Organization ***

  // Currency units
  currencyUnitListing: '/currency-unit/listing',
  createCurrencyUnit: '/currency-unit/create',
  // *** End Currency units ***

  // Organization onboarding
  onboardingCreateOrganization: '/onboarding/create-organization',
  onboardingNoOrganization: '/onboarding/no-organization',
  // *** End Organization onboarding ***
};
