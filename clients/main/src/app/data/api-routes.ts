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
  },
  // ***End***

  users: {
    profile: `${apiBaseUrls.user}/users/profile`,
  },
} as const;
