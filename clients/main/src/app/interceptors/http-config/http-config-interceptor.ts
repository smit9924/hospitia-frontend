import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError, timeout } from 'rxjs';
import { HTTP_REQ_TIMEOUT } from '../../types/enums/common';

export const REQUEST_TIMEOUT = new HttpContextToken<HTTP_REQ_TIMEOUT>(
  () => HTTP_REQ_TIMEOUT.DISABLED,
);

export const httpConfigInterceptor: HttpInterceptorFn = (req, next) => {
  const timeoutValue = req.context.get(REQUEST_TIMEOUT);

  // Skip timeout if disabled
  if (timeoutValue === HTTP_REQ_TIMEOUT.DISABLED) {
    return next(req);
  }

  // RxJS `timeout` operator automatically throws a `TimeoutError` if the request exceeds the specified time.
  // If timeout is not disabled/handled explicitly, this error will propagate through the stream.
  // The thrown `TimeoutError` is then caught by the global error handler for centralized handling.
  return next(req).pipe(
    timeout(timeoutValue),
    catchError((error) => {
      return throwError(() => error);
    }),
  );
};
