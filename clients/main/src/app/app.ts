import { Component, EventEmitter, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { LoaderService } from './services/loader.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoaderContainer,
    AsyncPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private loaderService: LoaderService = inject(LoaderService);

  protected readonly title = signal('main');
  protected loading: Observable<boolean>;

  constructor() {
    this.loading = this.loaderService.loading$;
  }
}
