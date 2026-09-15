import { DOCUMENT, inject, Injectable, OnDestroy, RendererFactory2, signal } from '@angular/core';
import { ThemePreference, ThemeType } from '../../types/enums/common';
import { Localstorage } from '../localstorage';
import { localStorageKeys } from '../../data/localstorage-keys';

@Injectable({
  providedIn: 'root',
})
export class DisplayAndAccessibility implements OnDestroy {
  largeTextPreference = signal(false);
  highContrastFocusPreference = signal(false);
  themePreference = signal(ThemePreference.LIGHT);
  activeTheme = signal(ThemeType.LIGHT);
  private document = inject(DOCUMENT);
  private localStorageService = inject(Localstorage);
  private rendererFactory = inject(RendererFactory2);
  private mediaQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private renderer = this.rendererFactory.createRenderer(null, null);
  private body = this.document.body;
  private defaultPreferences = {
    theme: ThemePreference.AUTO,
    largeText: false,
    highContrastFocus: false,
  };

  constructor() {
    this.mediaQuery?.addEventListener('change', this.mediaQueryListener.bind(this));

    this.initialize();
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.mediaQueryListener.bind(this));
  }

  private initialize(): void {
    this.initializeTheme();
    this.initializeLargeTextPreference();
    this.initializeHighContrastFocusPreference();
  }

  setTheme(themeClass: ThemePreference): void {
    Object.values(ThemePreference).forEach((theme) => {
      this.renderer.removeClass(this.body, theme);
    });

    this.renderer.addClass(this.body, themeClass);
    this.localStorageService.setItem(localStorageKeys.preferredTheme, themeClass);
    this.themePreference.set(themeClass);

    // Update active theme based on user preference
    if (themeClass === ThemePreference.AUTO) {
      this.activeTheme.set(this._activeTheme);
    } else {
      this.activeTheme.set(themeClass === ThemePreference.DARK ? ThemeType.DARK : ThemeType.LIGHT);
    }
  }

  restoreDefaultTheme(): void {
    this.setTheme(this.defaultPreferences.theme);
    this.setLargeTextPreference(this.defaultPreferences.largeText);
    this.setHighContrastFocusPreference(this.defaultPreferences.highContrastFocus);
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

  /**
   * Initializes the application theme preference from local storage.
   *
   * Reads the stored theme preference and applies it to the application. If no
   * preference is stored, the theme defaults to the device/system preference.
   */
  private initializeTheme(): void {
    const storedTheme = this.localStorageService.getItem(
      localStorageKeys.preferredTheme,
    ) as ThemePreference | null;

    this.setTheme(storedTheme ?? this.defaultPreferences.theme);
  }

  private get _activeTheme(): ThemeType {
    return this.mediaQuery?.matches ? ThemeType.DARK : ThemeType.LIGHT;
  }

  /**
   * Initializes the large text preference from local storage.
   *
   * Reads the stored large text preference and applies it to the root document
   * element. If the stored value is not explicitly `true`, the preference is
   * disabled.
   */
  private initializeLargeTextPreference(): void {
    const storedLargeTextPreference = this.localStorageService.getItem(
      localStorageKeys.largeTextPreference,
    );

    const largeTextPreferenceValue = storedLargeTextPreference
      ? !!storedLargeTextPreference
      : this.defaultPreferences.largeText;
    this.setLargeTextPreference(largeTextPreferenceValue);
  }

  /**
   * Enables or disables the large text preference.
   *
   * Adds the large text class to the root document element when enabled and
   * persists the preference in local storage. Removes the class and clears the
   * stored preference when disabled.
   *
   * @param isEnabled Whether larger application text should be enabled.
   */
  setLargeTextPreference(isEnabled: boolean): void {
    const largeTextClass = 'accessibility-large-text';

    if (isEnabled) {
      this.localStorageService.setItem(localStorageKeys.largeTextPreference, true);
      this.renderer.addClass(this.document.documentElement, largeTextClass);
      this.largeTextPreference.set(true);
    } else {
      this.localStorageService.removeItem(localStorageKeys.largeTextPreference);
      this.renderer.removeClass(this.document.documentElement, largeTextClass);
      this.largeTextPreference.set(false);
    }
  }

  /**
   * Initializes the high contrast focus preference from local storage.
   *
   * Reads the stored high contrast focus preference and applies it to the root
   * document element. If the stored value is not explicitly `true`, the preference
   * is disabled.
   */
  private initializeHighContrastFocusPreference(): void {
    const storedHighContrastFocusPreference = this.localStorageService.getItem(
      localStorageKeys.highContrastFocusPreference,
    );

    const highContrastFocusPreferenceValue = storedHighContrastFocusPreference
      ? !!storedHighContrastFocusPreference
      : this.defaultPreferences.highContrastFocus;
    this.setHighContrastFocusPreference(highContrastFocusPreferenceValue);
  }

  /**
   * Enables or disables the high contrast focus preference.
   *
   * Adds the high contrast focus class to the root document element when enabled
   * and persists the preference in local storage. Removes the class and clears
   * the stored preference when disabled.
   *
   * @param isEnabled Whether high contrast focus indicators should be enabled.
   */
  setHighContrastFocusPreference(isEnabled: boolean): void {
    const highContrastFocusClass = 'accessibility-high-contrast-focus';

    if (isEnabled) {
      this.localStorageService.setItem(localStorageKeys.highContrastFocusPreference, true);
      this.renderer.addClass(this.body, highContrastFocusClass);
      this.highContrastFocusPreference.set(true);
    } else {
      this.localStorageService.removeItem(localStorageKeys.highContrastFocusPreference);
      this.renderer.removeClass(this.body, highContrastFocusClass);
      this.highContrastFocusPreference.set(false);
    }
  }
}
