import { environment } from '../../environments/environment';

const apiBaseUrls = {
  auth: environment.authServiceBaseUrl,
  user: environment.authServiceBaseUrl,
} as const;

export const apiRoutes = {
  // Authentication related APIs
  auth: {
    login: `${apiBaseUrls.auth}/login`,
    refreshToken: `${apiBaseUrls.auth}/login/refresh-token`,
    forgotPassword: `${apiBaseUrls.auth}/login/forgot-password`,
  },
  // ***End***

  users: {
    signup: `${apiBaseUrls.user}/users/signup`,
    profile: `${apiBaseUrls.user}/users/profile`,
    usernameAvailability: `${apiBaseUrls.user}/users/check-username-availability`,
    changePassword: `${apiBaseUrls.user}/users/change-password`,
  },
} as const;
