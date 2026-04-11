import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { Loader } from '../../services/loader';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

/**
 * Context token used to skip global loader for specific HTTP requests.
 * By default, loader will be shown unless explicitly set to true.
 */
export const SkipLoading = new HttpContextToken<boolean>(() => false);

/**
 * Functional HTTP interceptor to manage global loading state.
 *
 * - Shows loader when a request starts
 * - Hides loader when request completes (success/error)
 * - Allows opt-out using `SkipLoading` context token
 */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService: Loader = inject(Loader);

  /**
   * If request has SkipLoading flag enabled,
   * bypass loader handling for this request.
   */
  if (req.context.get(SkipLoading)) {
    return next(req);
  }

  /**
   * Trigger loader before forwarding the request.
   */
  loaderService.showLoader();

  return next(req).pipe(
    /**
     * Ensure loader is hidden once request completes,
     * regardless of success or error.
     */
    finalize(() => {
      loaderService.hideLoader();
    }),
  );
};
