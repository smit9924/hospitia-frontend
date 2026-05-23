import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { apiRoutes } from '../data/api-routes';
import { LoginApiResponseDto, AccessTokenRenewalDto } from '../types/interfaces/auth';
import { Localstorage } from './localstorage';
import { Observable } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../data/localstorage-keys';
import { LoginApiResponse } from '../types/models/auth/login-api-response';
import { IncludeAuthToken } from '../interceptors/auth/auth-interceptor';
import { Router } from '@angular/router';
import { appRoutes } from '../data/app-routes';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private localstorageService = inject(Localstorage);
  private router = inject(Router);
  private tokens: Record<string, WritableSignal<string | null>> = {
    [LOCAL_STORAGE_KEYS.authToken]: signal(null),
    [LOCAL_STORAGE_KEYS.refreshToken]: signal(null),
    [LOCAL_STORAGE_KEYS.authTokenExpiry]: signal(null),
    [LOCAL_STORAGE_KEYS.refreshTokenExpiry]: signal(null),
  };

  constructor() {
    this.loadTokensFromLocalStorage();
  }

  private loadTokensFromLocalStorage(): void {
    for (const token of Object.keys(this.tokens)) {
      const tokenOrExpiryFromLocalStorage = this.localstorageService.getItem<string>(token);
      this.tokens[token].set(tokenOrExpiryFromLocalStorage);
    }
  }

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

  setAccessTokenSession(accessToken: string, accessTokenExpiry: string): void {
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.authToken, accessToken);
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.authTokenExpiry, accessTokenExpiry);

    this.tokens[LOCAL_STORAGE_KEYS.authToken].set(accessToken);
    this.tokens[LOCAL_STORAGE_KEYS.authTokenExpiry].set(accessTokenExpiry);
  }

  setRefreshTokenSession(refreshToken: string, refreshTokenExpiry: string): void {
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.refreshToken, refreshToken);
    this.localstorageService.setItem(LOCAL_STORAGE_KEYS.refreshTokenExpiry, refreshTokenExpiry);

    this.tokens[LOCAL_STORAGE_KEYS.refreshToken].set(refreshToken);
    this.tokens[LOCAL_STORAGE_KEYS.refreshTokenExpiry].set(refreshTokenExpiry);
  }

  logout(): void {
    this.deleteTokensFromLocalStorage();
    this.resetTokenSignals();
    this.router.navigateByUrl(appRoutes.login);
  }

  private deleteTokensFromLocalStorage(): void {
    for (const token of Object.keys(this.tokens)) {
      this.localstorageService.removeItem(token);
    }
  }

  private resetTokenSignals(): void {
    for (const token of Object.values(this.tokens)) {
      token.set(null);
    }
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInFromSignals() || this.isLoggedInFromLocalStorage();
  }

  private isLoggedInFromSignals(): boolean {
    const accessToken = this.tokens[LOCAL_STORAGE_KEYS.authToken]();
    const refreshToken = this.tokens[LOCAL_STORAGE_KEYS.refreshToken]();
    const accessTokenExpiry = this.tokens[LOCAL_STORAGE_KEYS.authTokenExpiry]();
    const refreshTokenExpiry = this.tokens[LOCAL_STORAGE_KEYS.refreshTokenExpiry]();

    return (
      this.isTokenValid(accessToken, accessTokenExpiry) ||
      this.isTokenValid(refreshToken, refreshTokenExpiry)
    );
  }

  private isLoggedInFromLocalStorage(): boolean {
    const accessToken = this.localstorageService.getItem<string>(LOCAL_STORAGE_KEYS.authToken);
    const refreshToken = this.localstorageService.getItem<string>(LOCAL_STORAGE_KEYS.refreshToken);
    const accessTokenExpiry = this.localstorageService.getItem<string>(
      LOCAL_STORAGE_KEYS.authTokenExpiry,
    );
    const refreshTokenExpiry = this.localstorageService.getItem<string>(
      LOCAL_STORAGE_KEYS.refreshTokenExpiry,
    );

    return (
      this.isTokenValid(accessToken, accessTokenExpiry) ||
      this.isTokenValid(refreshToken, refreshTokenExpiry)
    );
  }

  private isTokenValid(token: string | null, expiry: string | Date | null): boolean {
    if (!expiry || !token) {
      return false;
    }

    return Date.now() < new Date(expiry).getTime();
  }

  get isLoggedOut(): boolean {
    return !this.isLoggedIn;
  }

  get accessToken(): string | null {
    const accessTokenFromSignal = this.tokens[LOCAL_STORAGE_KEYS.authToken]()?.toString();
    const accessTokenFromLocalStorage = this.localstorageService.getItem<string>(
      LOCAL_STORAGE_KEYS.authToken,
    );

    return accessTokenFromSignal ?? accessTokenFromLocalStorage;
  }

  get refreshToken(): string | null {
    const refreshTokenFromSignal = this.tokens[LOCAL_STORAGE_KEYS.refreshToken]()?.toString();
    const refreshTokenFromLocalStorage = this.localstorageService.getItem<string>(
      LOCAL_STORAGE_KEYS.refreshToken,
    );

    return refreshTokenFromSignal ?? refreshTokenFromLocalStorage;
  }
}
