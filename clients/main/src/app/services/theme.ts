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
    this.mediaQuery?.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaQueryListener);
  }

  setTheme(themeClass: ThemePreference): void {
    const body = this.document.body;
    Object.values(ThemePreference).forEach((theme) => {
      this.renderer.removeClass(body, theme);
    });

    this.renderer.addClass(body, themeClass);
    this.localStorageService.setItem(LOCAL_STORAGE_KEYS.preferredTheme, themeClass);
    this.themePreference.set(themeClass);
  }

  private mediaQueryListener(event: MediaQueryListEvent): void {
    this.activeTheme.update(() => {
      if (event.matches) {
        return ThemeType.DARK;
      } else {
        return ThemeType.DARK;
      }
    });
  }
}
