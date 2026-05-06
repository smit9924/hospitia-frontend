import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GenericDialogButtonMetadata } from '../../../types/interfaces/common';
import { GenericDialogConfigData } from '../../../types/models/common/generic-dialog/generic-dialog-config-data';
import { GenericDialogButtonType } from '../../../types/enums/common';

@Component({
  selector: 'app-generic-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './generic-dialog.html',
  styleUrl: './generic-dialog.scss',
})
export class GenericDialog implements OnInit {
  private readonly dialogData: GenericDialogConfigData = inject(MAT_DIALOG_DATA);
  protected readonly GenericDialogButtonType = GenericDialogButtonType;
  buttons: GenericDialogButtonMetadata[] = [];
  title = '';
  contentText = '';

  public ngOnInit(): void {
    this.buttons = this.dialogData?.buttons ?? [];
    this.title = this.dialogData?.title ?? '';
    this.contentText = this.dialogData?.contentText ?? '';
  }

  protected onButtonClick(button: GenericDialogButtonMetadata): void {
    if (button.callback) {
      button.callback();
    }
  }
}
