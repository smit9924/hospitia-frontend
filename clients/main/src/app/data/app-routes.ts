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
};
