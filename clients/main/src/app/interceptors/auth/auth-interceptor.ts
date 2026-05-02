import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth';

/**
 * Context token used to control whether the auth token should be attached
 * to the request headers.
 * By default, auth token will be added unless explicitly set to false.
 */
export const IncludeAuthToken = new HttpContextToken<boolean>(() => true);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(IncludeAuthToken)) {
    const authService = inject(Auth);
    const accessToken = authService.accessToken;

    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }

  return next(req);
};
