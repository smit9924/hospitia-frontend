import { Component } from '@angular/core';
import { Typography } from '../typography/typography';

@Component({
  selector: 'app-style-guide',
  imports: [
    Typography
  ],
  templateUrl: './style-guide.html',
  styleUrl: './style-guide.scss',
})
export class StyleGuide {

}
