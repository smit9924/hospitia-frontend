export interface AccessTokenRenewalDto {
  accessToken: string;
  accessTokenExpiry: string;
  tokenType: string;
}

export interface LoginApiResponseDto extends AccessTokenRenewalDto {
  refreshToken: string;
  refreshTokenExpiry: string;
}
