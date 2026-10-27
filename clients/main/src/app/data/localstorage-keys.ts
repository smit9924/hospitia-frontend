export const localStorageKeys = {
  accessToken: 'authToken',
  accessTokenExpiry: 'authTokenExpiry',
  refreshToken: 'refreshToken',
  refreshTokenExpiry: 'refreshTokenExpiry',
  activeOrganization: 'activeOrganization',

  preferredTheme: 'preferredTheme',
  largeTextPreference: 'largeTextPreference',
  highContrastFocusPreference: 'highContrastFocusPreference',
} as const;
