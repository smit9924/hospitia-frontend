import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loaderInterceptor } from './interceptors/loader/loader-interceptor';
import { httpConfigInterceptor } from './interceptors/http-config/http-config-interceptor';
import { GlobalErrorHandler } from './error/global-error-handler';
import { authInterceptor } from './interceptors/auth/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    provideRouter(routes),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        floatLabel: 'always',
      },
    },
    provideHttpClient(
      withInterceptors([loaderInterceptor, httpConfigInterceptor, authInterceptor]),
    ),
  ],
};
