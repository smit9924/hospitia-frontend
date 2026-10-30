import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  /**
   * Shown while a newly created account is still being set up in the other
   * services; takes precedence over the generic loader.
   */
  private readonly _accountSetupLoading = signal(false);

  readonly accountSetupLoading = this._accountSetupLoading.asReadonly();

  showLoader() {
    this._loading.set(true);
  }

  hideLoader() {
    this._loading.set(false);
  }

  showAccountSetupLoader() {
    this._accountSetupLoading.set(true);
  }

  hideAccountSetupLoader() {
    this._accountSetupLoading.set(false);
  }
}
