import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { Icon } from './services/icon';
import { Navbar } from './components/common/navbar/navbar';
import { Footer } from './components/common/footer/footer';
import { DisplayAndAccessibility } from './services/display-and-accessibility/display-and-accessibility';
import { Layout } from './services/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderContainer, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Initialize icon service to register icons globally on application start
  private readonly _iconService: Icon = inject(Icon);
  private readonly _displayAndAccessibilityService: DisplayAndAccessibility =
    inject(DisplayAndAccessibility);
  readonly layoutService: Layout = inject(Layout);

  protected readonly title = signal('main');
}
