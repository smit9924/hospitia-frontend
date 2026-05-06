import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiRoutes } from '../data/api-routes';
import { LoginApiResponseDto, AccessTokenRenewalDto } from '../types/interfaces/auth';
import { Localstorage } from './localstorage';
import { Observable } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../data/localstorage-keys';
import { LoginApiResponse } from '../types/models/auth/login-api-response';
import { IncludeAuthToken } from '../interceptors/auth/auth-interceptor';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private localstorageService = inject(Localstorage);

  login(email: string, password: string, _rememberMe: boolean): Observable<LoginApiResponseDto> {
    const includeAuthTokenContext = new HttpContext().set(IncludeAuthToken, false);
    const body = new HttpParams()
      .set('username', email)
      .set('password', password)
      .set('remember_me', _rememberMe);
    return this.http.post<LoginApiResponseDto>(apiRoutes.auth.login, body, {
      context: includeAuthTokenContext,
    });
  }

  refreshAccessToken(): Observable<AccessTokenRenewalDto> {
    return this.http.post<AccessTokenRenewalDto>(
      apiRoutes.auth.refreshToken,
      { refreshToken: this.refreshToken },
      { context: new HttpContext().set(IncludeAuthToken, false) },
    );
  }

  setLoginSession(data: LoginApiResponse): void {
    this.setAccessTokenSession(data.accessToken, data.accessTokenExpiry);
    this.setRefreshTokenSession(data.refreshToken, data.refreshTokenExpiry);
  }

  setAccessTokenSession(accessToken: string, accessTokenExpiry: Date | string): void {
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.authToken, accessToken);
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.authTokenExpiry, accessTokenExpiry);
  }

  setRefreshTokenSession(refreshToken: string, refreshTokenExpiry: Date | string): void {
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.refreshToken, refreshToken);
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.refreshTokenExpiry, refreshTokenExpiry);
  }

  logout(): void {
    this.localstorageService.removeItem(LOCAL_STORAGE_KEYS.authToken);
    this.localstorageService.removeItem(LOCAL_STORAGE_KEYS.authTokenExpiry);
    this.localstorageService.removeItem(LOCAL_STORAGE_KEYS.refreshToken);
    this.localstorageService.removeItem(LOCAL_STORAGE_KEYS.refreshTokenExpiry);
  }

  get isLoggedIn(): boolean {
    const accessTokenExpStr = this.localstorageService.getItem(
      LOCAL_STORAGE_KEYS.authTokenExpiry,
    ) as string;

    if (accessTokenExpStr == null || accessTokenExpStr == undefined) {
      return false;
    }

    return Date.now() < new Date(accessTokenExpStr).getTime();
  }

  get isLoggedOut(): boolean {
    return !this.isLoggedIn;
  }

  get accessToken(): string | null {
    return this.localstorageService.getItem(LOCAL_STORAGE_KEYS.authToken) as string | null;
  }

  get refreshToken(): string | null {
    return this.localstorageService.getItem(LOCAL_STORAGE_KEYS.refreshToken) as string | null;
  }
}
