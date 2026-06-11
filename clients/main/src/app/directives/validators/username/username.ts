import { Directive, forwardRef } from '@angular/core';
import {
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Directive({
  selector: '[appUsername]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => usernameValidator),
      multi: true,
    },
  ],
})
export class Username {
  private validatorFn = usernameValidator();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validatorFn(control);
  }
}

const usernameInvalidationErrorsMessage: Record<string, string> = {
  startsWithLetter: $localize`must start with a letter`,
  endsWithLetterOrDigit: $localize`must end with a letter or digit`,
  invalidCharacters: $localize`can only include letters, digits, and underscores`,
  containsSpaces: $localize`cannot contain spaces`,
};

/**
 * Username validation rules:
 * 1. Must start with a letter
 * 2. Must end with a letter or digit
 * 3. Allows letters, digits, and underscore only
 *
 * NOTE:
 * This validator DOES NOT check min/max length.
 * If length validation is required, use Angular's built-in
 * Validators.minLength / Validators.maxLength separately.
 */

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const username: string = control.value;

    if (!username) return null;

    const errors: string[] = [];

    // Rule 1: must start with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      errors.push(usernameInvalidationErrorsMessage['startsWithLetter']);
    }

    // Rule 2: must end with letter or digit
    if (!/[a-zA-Z0-9]$/.test(username)) {
      errors.push(usernameInvalidationErrorsMessage['endsWithLetterOrDigit']);
    }

    // Rule 3: allowed characters only
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push(usernameInvalidationErrorsMessage['invalidCharacters']);
    }

    // Rule 4: no spaces
    if (/\s/.test(username)) {
      errors.push(usernameInvalidationErrorsMessage['containsSpaces']);
    }

    return errors?.length > 0 ? { usernameInvalid: errors } : null;
  };
}
