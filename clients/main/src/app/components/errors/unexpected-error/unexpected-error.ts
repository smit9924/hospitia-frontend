import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

/**
 * Blocking page for a signed-in user whose workspace could not be loaded
 * while navigating, e.g. right after signup, so they are not left on the
 * page they came from.
 */
@Component({
  selector: 'app-unexpected-error',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './unexpected-error.html',
  styleUrl: './unexpected-error.scss',
})
export class UnexpectedError {
  private readonly authService = inject(Auth);
  private readonly profileService = inject(Profile);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly isRetrying = signal(false);

  constructor() {
    // Move focus to the page heading so screen readers announce the blocking state.
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }

  /** Go home again: the route guards load the workspace on the way. */
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
