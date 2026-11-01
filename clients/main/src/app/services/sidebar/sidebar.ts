import { BreakpointObserver } from '@angular/cdk/layout';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { localStorageKeys } from '../../data/localstorage-keys';
import { Localstorage } from '../localstorage';

/** Below this width the sidebar is an overlay drawer instead of a fixed column. */
const COMPACT_VIEWPORT_QUERY = '(max-width: 1023.98px)';

/**
 * State of the app shell sidebar.
 *
 * - Wide screens (1024px and up): the sidebar is always shown; the toggle collapses it to an
 *   icon rail. The choice is remembered per browser.
 * - Tablet and phone: the sidebar is a drawer, closed by default; the toggle opens it.
 */
@Injectable({
  providedIn: 'root',
})
export class Sidebar {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly localstorageService = inject(Localstorage);

  /** True on tablet and phone widths, where the sidebar is an overlay drawer. */
  readonly isCompactViewport = toSignal(
    this.breakpointObserver.observe(COMPACT_VIEWPORT_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(COMPACT_VIEWPORT_QUERY) },
  );

  /** Wide screens only: whether the user collapsed the sidebar to icons. */
  readonly isCollapsedToRail = signal(
    this.localstorageService.getItem<boolean>(localStorageKeys.sidebarCollapsedToRail) ?? false,
  );

  /** Compact screens only: whether the drawer is open. */
  readonly isDrawerOpen = signal(false);

  /** `MatSidenav` mode: pushes content on wide screens, overlays it on compact ones. */
  readonly sidenavMode = computed(() => (this.isCompactViewport() ? 'over' : 'side'));

  /** Whether the `MatSidenav` is open. */
  readonly isSidenavOpened = computed(() =>
    this.isCompactViewport() ? this.isDrawerOpen() : true,
  );

  /** Whether the sidebar shows only icons. */
  readonly showsIconRail = computed(() => !this.isCompactViewport() && this.isCollapsedToRail());

  /** Whether the navigation is currently expanded, for the toggle's `aria-expanded`. */
  readonly isNavigationExpanded = computed(() =>
    this.isCompactViewport() ? this.isDrawerOpen() : !this.isCollapsedToRail(),
  );

  /** Opens/closes the drawer on compact screens; expands/collapses the rail on wide screens. */
  toggle(): void {
    if (this.isCompactViewport()) {
      this.isDrawerOpen.update((isOpen) => !isOpen);
      return;
    }
    const collapsedToRail = !this.isCollapsedToRail();
    this.isCollapsedToRail.set(collapsedToRail);
    this.localstorageService.setItem(localStorageKeys.sidebarCollapsedToRail, collapsedToRail);
  }

  /** Closes the drawer (no effect on wide screens, where the sidebar stays visible). */
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  /**
   * Keeps the drawer state in sync when `MatSidenav` closes itself
   * (backdrop click or Escape key).
   */
  syncSidenavOpenedState(isOpened: boolean): void {
    if (this.isCompactViewport()) {
      this.isDrawerOpen.set(isOpened);
    }
  }
}
