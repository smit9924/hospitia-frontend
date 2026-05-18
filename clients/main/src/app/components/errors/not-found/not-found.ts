import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Profile } from '../../../services/profile';

@Component({
  selector: 'app-not-found',
  imports: [MatButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  protected profileService = inject(Profile);
}
