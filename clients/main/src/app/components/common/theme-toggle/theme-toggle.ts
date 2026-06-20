import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { ThemePreference } from '../../../types/enums/common';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplayAndAccessibility } from '../../../services/display-and-accessibility/display-and-accessibility';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private themeService = inject(DisplayAndAccessibility);
  $localize = $localize;
  ThemePreference = ThemePreference;
  fontStyleControl = new FormControl<ThemePreference>(this.themeService.themePreference());

  constructor() {
    this.themeChangeDetection();
  }

  private themeChangeDetection(): void {
    effect(() => {
      const themePreference = this.themeService.themePreference();
      this.fontStyleControl.setValue(themePreference);
    });
  }

  changeTheme(event: MatButtonToggleChange): void {
    this.themeService.setTheme(event.value);
  }
}
