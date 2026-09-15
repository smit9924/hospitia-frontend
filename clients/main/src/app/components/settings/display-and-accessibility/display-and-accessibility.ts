import { Component, DestroyRef, effect, inject } from '@angular/core';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Snackbar } from '../../../services/snackbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeToggle } from '../../common/theme-toggle/theme-toggle';
import { SecondaryNavbar } from '../../common/secondary-navbar/secondary-navbar';
import { DisplayAndAccessibility as DisplayAndAccessibilityService } from '../../../services/display-and-accessibility/display-and-accessibility';

@Component({
  selector: 'app-display-and-accessibility',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    ThemeToggle,
    SecondaryNavbar,
  ],
  templateUrl: './display-and-accessibility.html',
  styleUrl: './display-and-accessibility.scss',
})
export class DisplayAndAccessibility {
  private snackbarService = inject(Snackbar);
  private themeService = inject(DisplayAndAccessibilityService);
  protected titleText = $localize`Display and Accessibility Settings`;
  protected largeTextToggleControl = new FormControl<boolean>(
    this.themeService.largeTextPreference(),
  );
  protected highContrastFocusToggleControl = new FormControl<boolean>(
    this.themeService.highContrastFocusPreference(),
  );

  constructor() {
    this.largeTextValueChangedListener();
    this.highContrastFocusValueChangedListener();
    this.largeTextToggleChanged();
    this.hightContrastFocusToggleChanged();
  }

  protected restoreDefaults(): void {
    this.themeService.restoreDefaultTheme();
    this.showSuccessSnackbar($localize`Display and accessibility settings restored.`);
  }

  private largeTextToggleChanged(): void {
    this.largeTextToggleControl.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((isEnabled) => {
        this.themeService.setLargeTextPreference(isEnabled ?? false);
      });
  }

  private largeTextValueChangedListener(): void {
    effect(() => {
      const isLargeTextEnabled = this.themeService.largeTextPreference();
      this.largeTextToggleControl.setValue(isLargeTextEnabled);
    });
  }

  private hightContrastFocusToggleChanged(): void {
    this.highContrastFocusToggleControl.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((isEnabled) => {
        this.themeService.setHighContrastFocusPreference(isEnabled ?? false);
      });
  }

  private highContrastFocusValueChangedListener(): void {
    effect(() => {
      const isHighContrastFocusEnabled = this.themeService.highContrastFocusPreference();
      this.highContrastFocusToggleControl.setValue(isHighContrastFocusEnabled);
    });
  }

  private showSuccessSnackbar(message: string): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: message,
      type: GenericSnackbarType.SUCCESS,
    });

    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });

    this.snackbarService.open(snackbarConfig);
  }
}
