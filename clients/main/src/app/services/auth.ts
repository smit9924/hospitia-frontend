import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiRoutes } from '../data/api-routes';
import { LoginApiResponse } from '../types/interfaces/auth';
import { ApiErrorResponse } from '../types/interfaces/common';
import { Localstorage } from './localstorage';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private localstorageService = inject(Localstorage);

  login(
    email: string | null | undefined,
    password: string | null | undefined,
    rememberMe: boolean | null | undefined,
  ): void {
    if (email != null && password != null && rememberMe != null) {
      const body = new HttpParams().set('username', email).set('password', password);

      this.http.post<LoginApiResponse>(apiRoutes.auth.login, body).subscribe({
        next: (token) => {
          this.localstorageService.setItem(LOCAL_STORAGE_KEYS.authToken, token.access_token);
          this.localstorageService.setItem(LOCAL_STORAGE_KEYS.refreshToken, token.refresh_token);
        },
        error: (error: HttpErrorResponse) => {
          const apiError = error.error as ApiErrorResponse<null>;
        },
      });
    }
  }
}
