import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../services/auth';
import { ActiveOrganizationResolver } from '../../../services/organization/active-organization-resolver';
import { Profile } from '../../../services/profile';
import { Snackbar } from '../../../services/snackbar';
import { GenericSnackbarDuration, GenericSnackbarType } from '../../../types/enums/common';
import { GenericSnackbarConfig } from '../../../types/models/common/generic-snackbar/generic-snackbar-config';
import { GenericSnackbarConfigData } from '../../../types/models/common/generic-snackbar/generic-snackbar-config-data';

/** Blocking page for a manager who is not linked to any organization. */
@Component({
  selector: 'app-no-organization',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './no-organization.html',
  styleUrl: './no-organization.scss',
})
export class NoOrganization {
  private readonly authService = inject(Auth);
  private readonly profileService = inject(Profile);
  private readonly activeOrganizationResolver = inject(ActiveOrganizationResolver);
  private readonly snackbarService = inject(Snackbar);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly isRetrying = signal(false);

  constructor() {
    // Move focus to the page heading so screen readers announce the blocking state.
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }

  /** Check memberships again, e.g. after an admin linked the manager to an organization. */
  protected async retry(): Promise<void> {
    this.isRetrying.set(true);
    try {
      const resolution = await this.activeOrganizationResolver.resolve();

      if (resolution.kind === 'resolved') {
        await this.profileService.redirectToDefaultHome();
      } else if (resolution.kind === 'redirect') {
        this.showStillUnlinkedSnackbar();
      }
    } finally {
      this.isRetrying.set(false);
    }
  }

  protected logout(): void {
    this.authService.logout();
  }

  private showStillUnlinkedSnackbar(): void {
    const snackbarConfigData = new GenericSnackbarConfigData({
      text: $localize`Still no organization linked to your account.`,
      type: GenericSnackbarType.INFO,
    });
    const snackbarConfig = new GenericSnackbarConfig({
      data: snackbarConfigData,
      duration: GenericSnackbarDuration.MEDIUM,
    });
    this.snackbarService.open(snackbarConfig);
  }
}
