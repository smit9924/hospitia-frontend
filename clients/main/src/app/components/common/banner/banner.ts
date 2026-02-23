import { Component, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export enum BANNER_TYPES {
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  SUCCESS = 4,
}

@Component({
  selector: 'app-banner',
  imports: [MatIconModule, MatTooltipModule],
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
