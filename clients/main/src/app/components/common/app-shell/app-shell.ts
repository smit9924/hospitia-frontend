import { Component, inject, input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { AppTopBar } from '../app-top-bar/app-top-bar';

/**
 * Page frame shared by every route.
 *
 * With `showsNavigation` (signed-in pages) it renders the collapsible sidebar and the top bar
 * around the routed page. Without it, only the projected public header, page and footer show.
 * The routed page is projected, so the single `<router-outlet>` is never re-created when the
 * layout switches.
 */
@Component({
  selector: 'app-shell',
  imports: [MatSidenavModule, AppSidebar, AppTopBar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly sidebarService = inject(Sidebar);

  /** Whether to show the sidebar and top bar (signed-in pages). */
  readonly showsNavigation = input(false);

  /** Moves keyboard focus past the navigation to the page content. */
  protected skipToMainContent(event: Event, mainContent: HTMLElement): void {
    event.preventDefault();
    mainContent.focus();
  }
}
