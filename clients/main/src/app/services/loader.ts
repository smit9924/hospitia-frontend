import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private loaderSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loaderSubject.asObservable();

  /**
   * Shown while a newly created account is still being set up in the other
   * services; takes precedence over the generic loader.
   */
  private accountSetupLoaderSubject = new BehaviorSubject<boolean>(false);

  accountSetupLoading$ = this.accountSetupLoaderSubject.asObservable();

  showLoader() {
    this.loaderSubject.next(true);
  }

  hideLoader() {
    this.loaderSubject.next(false);
  }

  showAccountSetupLoader() {
    this.accountSetupLoaderSubject.next(true);
  }

  hideAccountSetupLoader() {
    this.accountSetupLoaderSubject.next(false);
  }
}
