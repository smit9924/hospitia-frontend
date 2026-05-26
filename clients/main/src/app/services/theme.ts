import { DOCUMENT, inject, Injectable, OnDestroy, RendererFactory2, signal } from '@angular/core';
import { ThemePreference, ThemeType } from '../types/enums/common';
import { Localstorage } from './localstorage';
import { LOCAL_STORAGE_KEYS } from '../data/localstorage-keys';

@Injectable({
  providedIn: 'root',
})
export class Theme implements OnDestroy {
  themePreference = signal(ThemePreference.LIGHT);
  activeTheme = signal(ThemeType.LIGHT);
  private document = inject(DOCUMENT);
  private localStorageService = inject(Localstorage);
  private rendererFactory = inject(RendererFactory2);
  private mediaQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private renderer = this.rendererFactory.createRenderer(null, null);

  constructor() {
    this.mediaQuery?.addEventListener('change', this.mediaQueryListener.bind(this));

    // Initialize theme based on stored preference or system preference
    this.initializeTheme();
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaQueryListener.bind(this));
  }

  setTheme(themeClass: ThemePreference): void {
    const body = this.document.body;
    Object.values(ThemePreference).forEach((theme) => {
      this.renderer.removeClass(body, theme);
    });

    this.renderer.addClass(body, themeClass);
    this.localStorageService.setItem(LOCAL_STORAGE_KEYS.preferredTheme, themeClass);
    this.themePreference.set(themeClass);

    // Update active theme based on user preference
    if (themeClass === ThemePreference.AUTO) {
      this.activeTheme.set(this._activeTheme);
    } else {
      this.activeTheme.set(themeClass === ThemePreference.DARK ? ThemeType.DARK : ThemeType.LIGHT);
    }
  }

  private mediaQueryListener(event: MediaQueryListEvent): void {
    if (this.themePreference() === ThemePreference.AUTO) {
      // Update active theme based on system preference only if user preference is set to AUTO
      this.activeTheme.update(() => {
        if (event.matches) {
          return ThemeType.DARK;
        } else {
          return ThemeType.LIGHT;
        }
      });
    }
  }

  private initializeTheme(): void {
    const storedTheme = this.localStorageService.getItem(
      LOCAL_STORAGE_KEYS.preferredTheme,
    ) as ThemePreference | null;

    if (storedTheme) {
      this.setTheme(storedTheme);
    } else {
      this.setTheme(ThemePreference.AUTO);
    }
  }

  private get _activeTheme(): ThemeType {
    return this.mediaQuery?.matches ? ThemeType.DARK : ThemeType.LIGHT;
  }
}
