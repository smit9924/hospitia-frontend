import { Directive, forwardRef, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  AsyncValidatorFn,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Profile } from '../../../services/profile';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';

@Directive({
  selector: '[appUsernameAvailability]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => UsernameAvailability),
      multi: true,
    },
  ],
})
export class UsernameAvailability implements AsyncValidator {
  //NOTE: This directive is not tested, validation function is tested instead.
  private profileService = inject(Profile);
  private validatorFn = usernameAvailabilityValidator(this.profileService).bind(this);

  validate(
    control: AbstractControl,
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.validatorFn(control);
  }
}

const usernameAvailabilityErrorMessages: Record<string, string> = {
  usernameTaken: $localize`This username is taken. Please try a different one.`,
  usernameInvalid: $localize`Please enter a valid username.`,
};

// Reusable Async Validator Function
export function usernameAvailabilityValidator(
  profileService: Profile,
  debounceTimeMs = 400,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = control.value;

    if (!username) {
      return of(null);
    }

    // If the username is unchanged from the current profile, skip API call and validation.
    if (username === profileService.userProfile()?.username) {
      return of(null);
    }

    return timer(debounceTimeMs).pipe(
      switchMap(() => profileService.checkUsernameAvailability({ username: username })),

      // If API succeeds → username is available
      map(() => null),

      catchError((error: HttpErrorResponse) => {
        // Handle specific error codes indicating the username is already taken.
        // For all other errors, return null to prevent validation failures due to unexpected issues.

        const errorRes = error.error as ApiErrorResponse<unknown>;
        if (errorRes.errorCode === ErrorCodes.USER_WITH_USENAME_ALREADY_EXIST) {
          return of({ usernameTaken: usernameAvailabilityErrorMessages['usernameTaken'] });
        } else if (
          error.status === HttpStatusCode.UnprocessableEntity ||
          errorRes.errorCode === ErrorCodes.INVALID_USERNAME
        ) {
          return of({ usernameInvalid: usernameAvailabilityErrorMessages['usernameInvalid'] });
        } else {
          return of(null);
        }
      }),
    );
  };
}
