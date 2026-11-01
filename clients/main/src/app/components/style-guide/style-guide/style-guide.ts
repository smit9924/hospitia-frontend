import { Component } from '@angular/core';
import { Typography } from '../typography/typography';
import { Icons } from '../icons/icons';
import { DesignTokens } from '../design-tokens/design-tokens';
import { UiPatterns } from '../ui-patterns/ui-patterns';

@Component({
  selector: 'app-style-guide',
  imports: [DesignTokens, UiPatterns, Typography, Icons],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
})
export class StyleGuide {}
