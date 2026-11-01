import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { Icon } from './services/icon';
import { Navbar } from './components/common/navbar/navbar';
import { Footer } from './components/common/footer/footer';
import { AppShell } from './components/common/app-shell/app-shell';
import { DisplayAndAccessibility } from './services/display-and-accessibility/display-and-accessibility';
import { Layout } from './services/layout';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderContainer, Navbar, Footer, AppShell],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Initialize icon service to register icons globally on application start
  private readonly _iconService: Icon = inject(Icon);
  private readonly _displayAndAccessibilityService: DisplayAndAccessibility =
    inject(DisplayAndAccessibility);
  private readonly authService = inject(Auth);
  readonly layoutService: Layout = inject(Layout);

  protected readonly title = signal('main');

  /**
   * Signed-in pages that show navigation get the sidebar shell; public pages
   * (and routes marked `publicLayout`) keep the public header and footer.
   * Re-evaluated on every navigation, since the layout signals change then.
   */
  protected showsAppShellNavigation(): boolean {
    return (
      this.layoutService.showNavbar() &&
      !this.layoutService.usesPublicLayout() &&
      this.authService.isLoggedIn
    );
  }

  protected showsPublicHeader(): boolean {
    return this.layoutService.showNavbar() && !this.showsAppShellNavigation();
  }

  protected showsPublicFooter(): boolean {
    return this.layoutService.showFooter() && !this.showsAppShellNavigation();
  }
}
