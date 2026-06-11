import { Directive, forwardRef } from '@angular/core';
import {
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Directive({
  selector: '[appPasswordStrengthCheck]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => passwordStrengthValidator),
      multi: true,
    },
  ],
})
export class PasswordStrengthCheck {
  private validatorFn = passwordStrengthValidator();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validatorFn(control);
  }
}

const passwordStrengthErrorMessages: Record<string, string> = {
  minLength: $localize`at least 8 characters long`,
  maxLength: $localize`be no more than 50 characters long`,
  uppercase: $localize`include at least one uppercase letter`,
  lowercase: $localize`include at least one lowercase letter`,
  number: $localize`include at least one number`,
  specialChar: $localize`include at least one special character`,
};

/**
 * Creates a password strength validator.
 * Can be used directly in reactive forms.
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;

    // Do not validate empty values here (use required separately)
    if (!value) {
      return null;
    }

    const errors: string[] = [];

    if (value.length < 8) {
      errors.push(passwordStrengthErrorMessages['minLength']);
    }

    if (value.length > 50) {
      errors.push(passwordStrengthErrorMessages['maxLength']);
    }

    if (!/[A-Z]/.test(value)) {
      errors.push(passwordStrengthErrorMessages['uppercase']);
    }

    if (!/[a-z]/.test(value)) {
      errors.push(passwordStrengthErrorMessages['lowercase']);
    }

    if (!/[0-9]/.test(value)) {
      errors.push(passwordStrengthErrorMessages['number']);
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push(passwordStrengthErrorMessages['specialChar']);
    }

    // Return null if no errors found
    return errors.length > 0 ? { passwordStrength: errors } : null;
  };
}
