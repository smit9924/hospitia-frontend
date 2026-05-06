import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, map, Observable, shareReplay, switchMap, take, throwError } from 'rxjs';
import { Auth } from '../../services/auth';
import { inject } from '@angular/core';

/**
 * Context token used to control whether the auth token should be attached
 * to the request headers.
 * By default, auth token will be added unless explicitly set to false.
 */
export const IncludeAuthToken = new HttpContextToken<boolean>(() => true);

let refreshObservable$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  const addToken = (req: HttpRequest<unknown>, token: string) =>
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  if (!req.context.get(IncludeAuthToken)) {
    return next(req);
  }

  // 📸 Snapshot token when request leaves
  const tokenAtRequestTime = authService.accessToken;
  if (tokenAtRequestTime) {
    req = addToken(req, tokenAtRequestTime);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!authService.refreshToken) {
        authService.logout();
        return throwError(() => error);
      }

      // Token already rotated by a sibling request → just retry
      const currentToken = authService.accessToken;
      if (currentToken && currentToken !== tokenAtRequestTime) {
        return next(addToken(req, currentToken));
      }

      // No refresh in flight → start one
      if (!refreshObservable$) {
        refreshObservable$ = authService.refreshAccessToken().pipe(
          map((res) => {
            authService.setAccessTokenSession(res.accessToken, res.accessTokenExpiry);
            // Null INSIDE map — runs synchronously as part of emission,
            // so shareReplay still delivers to ALL current subscribers
            // before any new subscriber could see null and start a 2nd refresh
            refreshObservable$ = null;
            return res.accessToken;
          }),
          shareReplay(1),
          catchError((err) => {
            refreshObservable$ = null;
            authService.logout();
            return throwError(() => err);
          }),
        );
      }

      // All concurrent 401s queue here and share the single HTTP call
      return refreshObservable$.pipe(
        take(1),
        switchMap((newToken) => next(addToken(req, newToken))),
      );
    }),
  );
};
