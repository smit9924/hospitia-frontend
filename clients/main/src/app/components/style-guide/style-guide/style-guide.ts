import { Component } from '@angular/core';
import { Typography } from '../typography/typography';
import { Icons } from '../icons/icons';

@Component({
  selector: 'app-style-guide',
  imports: [Typography, Icons],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
})
export class StyleGuide {}
