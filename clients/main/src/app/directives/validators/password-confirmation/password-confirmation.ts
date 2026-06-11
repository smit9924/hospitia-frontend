import { Directive, forwardRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NG_ASYNC_VALIDATORS,
  NgForm,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Directive({
  selector: '[appPasswordConfirmation]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => passwordConfirmationValidator),
      multi: true,
    },
  ],
})
export class PasswordConfirmation {
  private validatorFn = passwordConfirmationValidator();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validatorFn(control);
  }
}

export function passwordConfirmationValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password: string = form.get('password')?.value?.trim();
    const confirmPassword: string = form.get('confirmPassword')?.value?.trim();

    if (
      password &&
      confirmPassword &&
      password !== '' &&
      confirmPassword !== '' &&
      password !== confirmPassword
    ) {
      return { passwordMismatch: true };
    }

    return null;
  };
}

export class ConfirmPasswordMatcher extends ErrorStateMatcher {
  override isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const defaultErrorState = super.isErrorState(control, form);

    const passwordMismatch = !!(form && form.hasError('passwordMismatch'));

    return defaultErrorState || passwordMismatch;
  }
}
