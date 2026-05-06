import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private loaderSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loaderSubject.asObservable();

  showLoader() {
    this.loaderSubject.next(true);
  }

  hideLoader() {
    this.loaderSubject.next(false);
  }
}
