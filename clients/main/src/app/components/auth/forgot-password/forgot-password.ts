import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { Dialog } from '../../../services/dialog';
import { Snackbar } from '../../../services/snackbar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {

  private authService = inject(Auth);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private destroyRef = inject(DestroyRef);

  appRoutes = appRoutes;

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  bannerMessage = '';
  isResetLinkSent = signal(false);
  resendSecondsLeft = signal(0);


  // TODO: Verified
  sendResetLink(): void {
    const email = this.forgotPasswordForm.value.email;

    if (this.forgotPasswordForm.valid && email != null) {
      this.requestPasswordReset(email);
    } else {
      this.dialogService.openOkDialog(
        $localize`Password Reset Failed`,
        $localize`Please enter a valid email address before submitting the form.`,
      );
    }
  }

  // TODO: Verified
  resendResetLink(): void {
    if (this.resendSecondsLeft() > 0) {
      this.showSnackbar($localize`Please wait ${this.resendSecondsLeft()} seconds before resending the password reset link.`, GenericSnackbarType.WARNING);
      return;
    }

    this.sendResetLink();
  }

  // TODO: Verified
  private requestPasswordReset(email: string): void {
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isResetLinkSent.set(true);
        this.startResendTimer();
        this.showSnackbar($localize`Password reset link sent.`, GenericSnackbarType.SUCCESS);
      },
      error: (error: HttpErrorResponse) => {
        // The forgot password API intentionally returns 200 OK even when the email is not
        // registered, so account existence is not exposed. Only network or unexpected
        // server errors are expected here, and those handled globally.

        throw error;
      },
    });
  }

  // TODO: Verified
  private startResendTimer(): void {
    this.resendSecondsLeft = signal(environment.forgotPasswordResendTimeoutSeconds);

    interval(1000)
      .pipe(
        take(environment.forgotPasswordResendTimeoutSeconds),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        this.resendSecondsLeft.update((seconds) => seconds - 1);
      });
  }

  // TODO: Verified
  private showSnackbar(text: string, type: GenericSnackbarType): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: text,
      type: type,
    });

    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });

    this.snackbarService.open(snackbarConfig);
  }
}
