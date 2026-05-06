import { inject, Injectable } from '@angular/core';
import { GenericDialogConfig } from '../types/models/common/generic-dialog/generic-dialog-config';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { GenericDialog } from '../components/common/generic-dialog/generic-dialog';
import { GenericDialogButtonMetadata } from '../types/interfaces/common';
import { GenericDialogButtonType } from '../types/enums/common';
import { GenericDialogConfigData } from '../types/models/common/generic-dialog/generic-dialog-config-data';

@Injectable({
  providedIn: 'root',
})
export class Dialog {
  private dialog = inject(MatDialog);

  /**
   * Opens a generic dialog and returns a MatDialogRef.
   * Use this when you need full control over the ref (e.g. update button states).
   */
  open<D = unknown>(config: MatDialogConfig): MatDialogRef<GenericDialog, null> {
    const ref = this.dialog.open<GenericDialog, GenericDialogConfig<D>, null>(
      GenericDialog,
      config,
    );

    return ref;
  }

  openOkDialog(title: string, contentText: string): void {
    const buttons: GenericDialogButtonMetadata[] = [
      {
        label: $localize`Ok`,
        closeOnClick: true,
        type: GenericDialogButtonType.FILLED,
      },
    ];

    const dialogData = new GenericDialogConfigData({
      buttons,
      title,
      contentText,
    });

    const dialogConfig = new GenericDialogConfig<GenericDialogConfigData>({
      data: dialogData,
    });

    this.open(dialogConfig);
  }
}
