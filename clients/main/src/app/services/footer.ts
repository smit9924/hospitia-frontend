import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Footer {
  private _visible = signal(false);
  readonly visible = this._visible.asReadonly();

  /**
   * Show navbar
   */
  show(): void {
    this._visible.set(true);
  }

  /**
   * Hide navbar
   */
  hide(): void {
    this._visible.set(false);
  }
}
