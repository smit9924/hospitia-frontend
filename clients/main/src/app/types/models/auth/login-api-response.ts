import { LoginApiResponseDto } from '../../interfaces/auth';

export class LoginApiResponse {
  accessToken = '';
  accessTokenExpiry = '';
  refreshToken = '';
  refreshTokenExpiry = '';
  tokenType = '';

  constructor(data: LoginApiResponseDto) {
    Object.assign(this, data);
  }

  public get accessTokenExpiryDate(): Date {
    return new Date(this.accessTokenExpiry);
  }

  public get refreshTokenExpiryDate(): Date {
    return new Date(this.refreshTokenExpiry);
  }
}
