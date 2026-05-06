import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { Icon } from './services/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Initialize icon service to register icons globally on application start
  private readonly _iconService: Icon = inject(Icon);

  protected readonly title = signal('main');
}
