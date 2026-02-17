import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-typography',
  imports: [MatCardModule, MatDividerModule],
  templateUrl: './typography.html',
  styleUrl: './typography.scss',
})
export class Typography {
  public sentence = 'A quick brown fox jumps over the lazy dog.';
  public headingFontSizeData = [
    {
      id: 1,
      title: 'Heading Extra Large',
      class: 'heading-extra-large',
      fontSizeRem: '2.5rem',
      fontSizePx: '40px',
      fontWeight: 700,
    },
    {
      id: 2,
      title: 'Heading Large',
      class: 'heading-large',
      fontSizeRem: '2rem',
      fontSizePx: '32px',
      fontWeight: 600,
    },
    {
      id: 3,
      title: 'Heading Medium',
      class: 'heading-medium',
      fontSizeRem: '1.75rem',
      fontSizePx: '28px',
      fontWeight: 600,
    },
    {
      id: 4,
      title: 'Heading Small',
      class: 'heading-small',
      fontSizeRem: '1.5rem',
      fontSizePx: '24px',
      fontWeight: 500,
    },
    {
      id: 5,
      title: 'Heading Extra Small',
      class: 'heading-extra-small',
      fontSizeRem: '1.25rem',
      fontSizePx: '20px',
      fontWeight: 500,
    },
    {
      id: 6,
      title: 'Heading Tiny',
      class: 'heading-tiny',
      fontSizeRem: '1.125rem',
      fontSizePx: '18px',
      fontWeight: 500,
    },
  ];

  public bodyFontSizeData = [
    {
      id: 1,
      title: 'Body Large',
      class: 'body-large',
      fontSizeRem: '1rem',
      fontSizePx: '16px',
      fontWeight: 400,
    },
    {
      id: 2,
      title: 'Body Medium',
      class: 'body-medium',
      fontSizeRem: '0.875rem',
      fontSizePx: '14px',
      fontWeight: 400,
    },
    {
      id: 3,
      title: 'Body Small',
      class: 'body-small',
      fontSizeRem: '0.75rem',
      fontSizePx: '12px',
      fontWeight: 400,
    },
  ];
}
