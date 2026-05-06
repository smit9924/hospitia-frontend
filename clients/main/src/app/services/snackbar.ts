import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericSnackbar } from '../components/common/generic-snackbar/generic-snackbar';
import { GenericSnackbarConfig } from '../types/models/common/generic-snackbar/generic-snackbar-config';

@Injectable({
  providedIn: 'root',
})
export class Snackbar {
  private snackBar = inject(MatSnackBar);

  open(config: GenericSnackbarConfig): void {
    config.politeness = config.ariaPoliteness; // Ensure politeness is set based on the snackbar type
    config.panelClass = config.snackbarPanelClass; // Ensure panel class is set based on the snackbar type
    this.snackBar.openFromComponent(GenericSnackbar, config);
  }
}
