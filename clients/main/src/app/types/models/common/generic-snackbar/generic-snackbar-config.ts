import {
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../enums/common';
import { GenericSnackbarConfigData } from './generic-snackbar-config-data';

// snackbar.constants.ts
export const SNACKBAR_CLASS_MAP: Record<GenericSnackbarType, string> = {
  [GenericSnackbarType.SUCCESS]: 'snackbar-success',
  [GenericSnackbarType.ERROR]: 'snackbar-error',
  [GenericSnackbarType.WARNING]: 'snackbar-warning',
  [GenericSnackbarType.INFO]: 'snackbar-info',
  [GenericSnackbarType.DEFAULT]: 'snackbar-default',
};

export class GenericSnackbarConfig extends MatSnackBarConfig<GenericSnackbarConfigData> {
  override verticalPosition?: MatSnackBarVerticalPosition = 'top';
  override horizontalPosition?: MatSnackBarHorizontalPosition = 'center';
  // TODO: Below must set to default
  override duration?: GenericSnackbarDuration = GenericSnackbarDuration.INFINITE;

  constructor(config?: Partial<GenericSnackbarConfig>) {
    super();
    Object.assign(this, config);
  }

  get ariaPoliteness(): 'off' | 'polite' | 'assertive' {
    switch (this.data?.type) {
      case GenericSnackbarType.ERROR:
      case GenericSnackbarType.WARNING:
        return 'assertive';
      case GenericSnackbarType.SUCCESS:
      case GenericSnackbarType.INFO:
        return 'polite';
      default:
        return 'off';
    }
  }

  get snackbarPanelClass(): string {
    return SNACKBAR_CLASS_MAP[this.data?.type || GenericSnackbarType.DEFAULT];
  }
}
