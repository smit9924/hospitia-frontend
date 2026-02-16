import { inject, Injectable } from '@angular/core';
import { IconList } from '../data/icon-list';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class Icon {
  private readonly matIconRegistry: MatIconRegistry = inject(MatIconRegistry);
  private readonly sanatizer: DomSanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcon();
  }

  private registerIcon(): void {
    for(const icon of IconList) {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.sanatizer.bypassSecurityTrustResourceUrl(icon.src),
      );
    }
  }
}
