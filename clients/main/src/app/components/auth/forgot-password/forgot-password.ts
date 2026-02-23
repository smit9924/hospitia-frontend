import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../../../data/app-routes';


/* Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})

export class ForgotPassword {
  APP_ROUTES = APP_ROUTES;
  email: string = '';
  loading = false;

  onSubmit(): void {
    if (!this.email || this.loading) return;

    this.loading = true;

    // 👉 Call your API here
    console.log('Reset password requested for:', this.email);

    // simulate API
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }
}