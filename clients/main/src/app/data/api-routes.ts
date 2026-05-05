import { environment } from '../../environments/environment';

const apiBaseUrls = {
  auth: environment.authApiBaseUrl,
} as const;

export const apiRoutes = {
  // Authentication related APIs
  auth: {
    login: `${apiBaseUrls.auth}/login`,
    refreshToken: `${apiBaseUrls.auth}/login/refresh-token`,
  },
  // ***End***
} as const;
