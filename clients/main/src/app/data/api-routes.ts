import { environment } from '../../environments/environment';

const apiBaseUrls = {
  auth: environment.authServiceBaseUrl,
  user: environment.authServiceBaseUrl,
  dashboard: environment.dashboardServiceBaseUrl,
} as const;

export const apiRoutes = {
  // Authentication related APIs
  auth: {
    login: `${apiBaseUrls.auth}/login`,
    refreshToken: `${apiBaseUrls.auth}/login/refresh-token`,
    forgotPassword: `${apiBaseUrls.auth}/login/forgot-password`,
    resetPassword: `${apiBaseUrls.auth}/login/reset-password`,
  },
  // ***End***

  users: {
    signup: `${apiBaseUrls.user}/users/signup`,
    signupCustomer: `${apiBaseUrls.user}/users/signup-customer`,
    profile: `${apiBaseUrls.user}/users/profile`,
    usernameAvailability: `${apiBaseUrls.user}/users/check-username-availability`,
    changePassword: `${apiBaseUrls.user}/users/change-password`,
    requestEmailVerificationOtp: `${apiBaseUrls.user}/users/request-email-verification-otp`,
    verifyEmailOtp: `${apiBaseUrls.user}/users/verify-email-otp`,
    listAdmins: `${apiBaseUrls.dashboard}/users/admins`,
    listOwners: `${apiBaseUrls.dashboard}/users/owners`,
    listManagers: `${apiBaseUrls.dashboard}/users/managers`,
    listCustomers: `${apiBaseUrls.dashboard}/users/customers`,
    getAdmin: (guid: string) => `${apiBaseUrls.user}/users/admins/${guid}`,
    createAdmin: `${apiBaseUrls.user}/users/admins`,
    updateAdmin: `${apiBaseUrls.user}/users/admins`,
    getOwner: (guid: string) => `${apiBaseUrls.user}/users/owners/${guid}`,
    createOwner: `${apiBaseUrls.user}/users/owners`,
    updateOwner: `${apiBaseUrls.user}/users/owners`,
    getManager: (guid: string) => `${apiBaseUrls.user}/users/managers/${guid}`,
    createManager: `${apiBaseUrls.user}/users/managers`,
    updateManager: `${apiBaseUrls.user}/users/managers`,
    getCustomer: (guid: string) => `${apiBaseUrls.user}/users/customers/${guid}`,
    createCustomer: `${apiBaseUrls.user}/users/customers`,
    updateCustomer: `${apiBaseUrls.user}/users/customers`,
  },
} as const;
