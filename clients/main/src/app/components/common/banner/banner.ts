import { Component, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BANNER_TYPES } from '../../../types/enums/common';

@Component({
  selector: 'app-banner',
  imports: [MatIconModule, MatTooltipModule, MatButtonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  @Input() type: BANNER_TYPES = BANNER_TYPES.INFO;
  public BANNER_TYPES = BANNER_TYPES;
  isVisible = signal(false);

  show(): void {
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
  }
}
