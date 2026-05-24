import { ErrorHandler, inject } from '@angular/core';
import { Dialog } from '../services/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

export class GlobalErrorHandler implements ErrorHandler {
  private dialogService = inject(Dialog);

  handleError(error: unknown) {
    console.error('unexpected error occured: ', error);
    // Network Error
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.dialogService.openOkDialog(
        $localize`Network Error`,
        $localize`A network error occurred. Please check your internet connection and try again.`,
      );
    } else if (error instanceof TimeoutError) {
      this.dialogService.openOkDialog(
        $localize`Request Timeout`,
        $localize`The request took too long to complete. Please check your internet connection and try again.`,
      );
    } else {
      this.dialogService.openOkDialog(
        $localize`Unexpected Error`,
        $localize`Opps! An unexpected error occurred. Please refresh the page and try again. If the problem persists, contact support.`,
      );
    }
  }
}
