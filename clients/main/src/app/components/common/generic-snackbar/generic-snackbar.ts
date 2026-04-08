import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { GenericSnackbarType } from '../../../types/enums/common';
import { CommonModule } from '@angular/common';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

interface SnackbarMeta {
  icon: string;
  ariaRole: 'alert' | 'status';
}

const TYPE_META: Record<GenericSnackbarType, SnackbarMeta> = {
  [GenericSnackbarType.DEFAULT]: { icon: 'notificationAdd', ariaRole: 'status' },
  [GenericSnackbarType.SUCCESS]: { icon: 'success', ariaRole: 'status' },
  [GenericSnackbarType.WARNING]: { icon: 'warning', ariaRole: 'alert' },
  [GenericSnackbarType.INFO]: { icon: 'info', ariaRole: 'status' },
  [GenericSnackbarType.ERROR]: { icon: 'error', ariaRole: 'alert' },
};

@Component({
  selector: 'app-generic-snackbar',
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './generic-snackbar.html',
  styleUrl: './generic-snackbar.scss',
})
export class GenericSnackbar {
  TYPE_META = TYPE_META;
  readonly data = inject<GenericSnackbarConfigData>(MAT_SNACK_BAR_DATA);
  readonly snackbarRef = inject(MatSnackBarRef<GenericSnackbar>);

  dismiss(): void {
    this.snackbarRef.dismiss();
  }
}
