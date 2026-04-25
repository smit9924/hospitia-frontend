import { ErrorHandler, inject } from '@angular/core';
import { Dialog } from '../services/dialog';
import { HttpErrorResponse } from '@angular/common/http';

export class GlobalErrorHandler implements ErrorHandler {
  private dialogService = inject(Dialog);

  handleError(error: unknown) {
    // Network Error
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.dialogService.openOkDialog(
        $localize`Network Error`,
        $localize`A network error occurred. Please check your internet connection and try again.`,
      );
    } else {
      this.dialogService.openOkDialog(
        $localize`Unexpected Error`,
        $localize`Opps! An unexpected error occurred. Please refresh the page and try again. If the problem persists, contact support.`,
      );
    }
  }
}
