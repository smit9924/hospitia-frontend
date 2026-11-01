import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/** One color token shown as a swatch in the style guide. */
interface ColorTokenSwatch {
  name: string;
  token: string;
  usage: string;
}

/** Group of related color tokens, e.g. "Surfaces". */
interface ColorTokenGroup {
  title: string;
  swatches: ColorTokenSwatch[];
}

/**
 * Style guide section listing the central color tokens (styles/colors.scss and the Material
 * theme). Swatches read the live CSS variables, so they follow the light/dark theme.
 */
@Component({
  selector: 'app-design-tokens',
  imports: [MatCardModule],
  templateUrl: './design-tokens.html',
  styleUrl: './design-tokens.scss',
})
export class DesignTokens {
  protected readonly colorTokenGroups: ColorTokenGroup[] = [
    {
      title: 'Brand',
      swatches: [
        { name: 'Primary', token: '--mat-sys-primary', usage: 'Primary actions, links, focus' },
        {
          name: 'Primary container',
          token: '--mat-sys-primary-container',
          usage: 'Icon tiles, selected chips',
        },
        { name: 'Tertiary', token: '--mat-sys-tertiary', usage: 'Secondary accents' },
        {
          name: 'Active navigation',
          token: '--app-color-nav-active',
          usage: 'Current sidebar link',
        },
      ],
    },
    {
      title: 'Surfaces',
      swatches: [
        { name: 'Page ground', token: '--app-color-page-ground', usage: 'Behind every page' },
        { name: 'Card', token: '--app-color-card', usage: 'Cards, sidebar, tables' },
        {
          name: 'Card raised',
          token: '--app-color-card-raised',
          usage: 'Table header, hover rows',
        },
        {
          name: 'Border subtle',
          token: '--app-color-border-subtle',
          usage: 'Card and field outlines',
        },
      ],
    },
    {
      title: 'Status',
      swatches: [
        {
          name: 'Success',
          token: '--mat-sys-success-container',
          usage: 'Success banners and chips',
        },
        { name: 'Warning', token: '--mat-sys-warning-container', usage: 'Warnings' },
        { name: 'Error', token: '--mat-sys-error-container', usage: 'Errors' },
        { name: 'Info', token: '--mat-sys-info-container', usage: 'Information' },
      ],
    },
  ];

  protected tokenValue(token: string): string {
    return `var(${token})`;
  }
}
