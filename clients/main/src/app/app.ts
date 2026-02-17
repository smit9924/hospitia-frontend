import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { Loader } from './services/loader';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Icon } from './services/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderContainer, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly _iconService: Icon = inject(Icon);
  private loaderService: Loader = inject(Loader);

  protected readonly title = signal('main');
  protected loading: Observable<boolean>;

  constructor() {
    this.loading = this.loaderService.loading$;
  }
}
