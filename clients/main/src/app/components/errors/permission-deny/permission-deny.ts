import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Profile } from '../../../services/profile';

@Component({
  selector: 'app-permission-deny',
  imports: [MatButtonModule],
  templateUrl: './permission-deny.html',
  styleUrl: './permission-deny.scss',
})
export class PermissionDeny {
  protected profileService = inject(Profile);
}
