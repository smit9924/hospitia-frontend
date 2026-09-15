import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';
import { interval, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Dialog } from '../../../services/dialog';
import { Profile } from '../../../services/profile';
import { Snackbar } from '../../../services/snackbar';
import { User } from '../../../services/user/user';
import { Banner } from '../../common/banner/banner';
import { ApiErrorResponse } from '../../../types/interfaces/common';
import { ErrorCodes } from '../../../types/enums/error-codes';
import {
  BANNER_TYPES,
  GenericSnackbarDuration,
  GenericSnackbarType,
} from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';

@Component({
  selector: 'app-verify-email',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    Banner,
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private userService = inject(User);
  private profileService = inject(Profile);
  private dialogService = inject(Dialog);
  private snackbarService = inject(Snackbar);
  private destroyRef = inject(DestroyRef);

  @ViewChild('verifyEmailBanner') banner!: Banner;

  otpLength = 6;
  bannerMessage = '';
  resendSecondsLeft = signal(0);

  verifyEmailForm = new FormGroup({
    otp: new FormControl('', [
      Validators.required,
      Validators.pattern(`^[0-9]{${this.otpLength}}$`),
    ]),
  });

  ngOnInit(): void {
    this.requestOtp();
  }

  verifyOtp(): void {
    const otp = this.verifyEmailForm.value.otp;

    if (this.verifyEmailForm.valid && otp != null) {
      this.userService.verifyEmailOtp(otp).subscribe({
        next: async () => {
          this.showSnackbar($localize`Email verified successfully.`, GenericSnackbarType.SUCCESS);
          await this.profileService.loadProfile();
          await this.profileService.redirectToDefaultHome();
        },
        error: async (error: HttpErrorResponse) => {
          const errorRes = error.error as ApiErrorResponse<unknown>;

          if (errorRes?.errorCode === ErrorCodes.INVALID_OTP) {
            this.showBanner($localize`Invalid or expired OTP. Please try again.`);
          } else if (errorRes?.errorCode === ErrorCodes.EMAIL_ALREADY_VERIFIED) {
            await void this.profileService.loadProfile();
            await void this.profileService.redirectToDefaultHome();
          } else {
            throw error;
          }
        },
      });
    } else {
      this.dialogService.openOkDialog(
        $localize`Verification Failed`,
        $localize`Please enter a valid ${this.otpLength}-digit OTP before submitting.`,
      );
    }
  }

  resendOtp(): void {
    if (this.resendSecondsLeft() > 0) {
      this.showSnackbar(
        $localize`Please wait ${this.resendSecondsLeft()} seconds before resending the OTP.`,
        GenericSnackbarType.WARNING,
      );
      return;
    }

    this.requestOtp();
  }

  private requestOtp(): void {
    this.userService.requestEmailVerificationOtp().subscribe({
      next: () => {
        this.startResendTimer();
        this.showSnackbar(
          $localize`A verification OTP has been sent to your email.`,
          GenericSnackbarType.SUCCESS,
        );
      },
      error: (error: HttpErrorResponse) => {
        const errorRes = error.error as ApiErrorResponse<unknown>;

        if (errorRes?.errorCode === ErrorCodes.EMAIL_ALREADY_VERIFIED) {
          void this.profileService.loadProfile().then(() => {
            void this.profileService.redirectToDefaultHome();
          });
        } else {
          throw error;
        }
      },
    });
  }

  private startResendTimer(): void {
    this.resendSecondsLeft = signal(environment.emailVerificationResendTimeoutSeconds);

    if (environment.emailVerificationResendTimeoutSeconds <= 0) {
      return;
    }

    interval(1000)
      .pipe(
        take(environment.emailVerificationResendTimeoutSeconds),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.resendSecondsLeft.update((seconds) => seconds - 1);
      });
  }

  private showSnackbar(text: string, type: GenericSnackbarType): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text,
      type,
    });
    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });
    this.snackbarService.open(snackbarConfig);
  }

  private showBanner(message: string, type: BANNER_TYPES = BANNER_TYPES.ERROR): void {
    this.bannerMessage = message;
    this.banner.type = type;
    this.banner.show();
  }
}
