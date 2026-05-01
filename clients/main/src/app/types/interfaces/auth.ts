export interface LoginApiResponseDto {
  accessToken: string;
  accessTokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  tokenType: string;
}
