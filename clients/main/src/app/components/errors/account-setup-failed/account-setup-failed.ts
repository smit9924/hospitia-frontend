import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

/**
 * Blocking page for a new user whose account is still not set up in the
 * booking service after every retry (the signup event has not arrived yet).
 */
@Component({
  selector: 'app-account-setup-failed',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './account-setup-failed.html',
  styleUrl: './account-setup-failed.scss',
})
export class AccountSetupFailed {
  private readonly authService = inject(Auth);
  private readonly profileService = inject(Profile);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly isRetrying = signal(false);

  constructor() {
    // Move focus to the page heading so screen readers announce the blocking state.
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }

  /** Go home again: the route guard retries the account setup check on the way. */
  protected async retry(): Promise<void> {
    this.isRetrying.set(true);
    try {
      await this.profileService.redirectToDefaultHome();
    } finally {
      this.isRetrying.set(false);
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
