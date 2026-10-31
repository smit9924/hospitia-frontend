import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { appConstants } from '../../data/constants';
import { Auth } from '../../services/auth';
import { Organization } from '../../services/organization/organization';
import { Profile } from '../../services/profile';
import { Snackbar } from '../../services/snackbar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../types/enums/common';
import { ErrorCodes } from '../../types/enums/error-codes';
import { ApiErrorResponse } from '../../types/interfaces/common';
import { GenericSnackbarConfig } from '../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../types/models/common/generic-snackbar/generic-snackbar-config-data';

/**
 * Sends the active organization with every booking-service request and reacts
 * when the backend rejects it:
 * - ACTIVE_ORGANIZATION_INVALID → clear it, explain, and log the user out;
 * - ACTIVE_ORGANIZATION_REQUIRED → clear it and resolve it again.
 * Handled errors complete the request without a value, so callers don't also
 * show a generic error.
 */
export const activeOrganizationInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.bookingServiceBaseUrl)) {
    return next(req);
  }

  const organizationService = inject(Organization);
  const authService = inject(Auth);
  const profileService = inject(Profile);
  const snackbarService = inject(Snackbar);

  const activeOrganization = organizationService.activeOrganization();
  if (activeOrganization) {
    req = req.clone({
      setHeaders: { [appConstants.httpHeaders.activeOrganizationGuid]: activeOrganization.guid },
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      const errorCode =
        error instanceof HttpErrorResponse
          ? (error.error as ApiErrorResponse<unknown> | null)?.errorCode
          : undefined;

      if (errorCode === ErrorCodes.ACTIVE_ORGANIZATION_INVALID) {
        // Concurrent rejections are handled once: the first one clears the organization.
        if (organizationService.activeOrganization() !== null) {
          organizationService.clearActiveOrganization();
          snackbarService.open(
            new GenericSnackbarConfig({
              data: new GenericSnackbarConfigData({
                text: $localize`Your organization is no longer available. Please log in again.`,
                type: GenericSnackbarType.ERROR,
              }),
              duration: GenericSnackbarDuration.LONG,
            }),
          );
          authService.logout();
        }
        return EMPTY;
      }

      if (errorCode === ErrorCodes.ACTIVE_ORGANIZATION_REQUIRED) {
        organizationService.clearActiveOrganization();
        void profileService.redirectToDefaultHome();
        return EMPTY;
      }

      return throwError(() => error);
    }),
  );
};
