import { Component, inject } from '@angular/core';
import { Spinner } from '../spinner/spinner';
import { Loader } from '../../../services/loader';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader-container',
  imports: [Spinner, AsyncPipe],
  templateUrl: './loader-container.html',
  styleUrl: './loader-container.scss',
})
export class LoaderContainer {
  private loaderService: Loader = inject(Loader);

  protected loading: Observable<boolean>;

  constructor() {
    this.loading = this.loaderService.loading$;
  }
}
