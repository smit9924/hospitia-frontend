import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { Auth } from '../../../services/auth';
import {
  OrganizationMembershipSummary,
  OrganizationSelectionDialogData,
} from '../../../types/interfaces/organization';

export const ORGANIZATION_SELECTION_DESCRIPTION_ID = 'organization-selection-description';

/**
 * Blocking dialog asking an owner/manager with several organizations which one
 * to work in for this session. Closes with the chosen organization, or `null`
 * when the user logs out instead.
 */
@Component({
  selector: 'app-organization-selection-dialog',
  imports: [MatDialogModule, MatButtonModule, MatRadioModule],
  templateUrl: './organization-selection-dialog.html',
  styleUrl: './organization-selection-dialog.scss',
})
export class OrganizationSelectionDialog {
  private readonly dialogRef =
    inject<MatDialogRef<OrganizationSelectionDialog, OrganizationMembershipSummary | null>>(
      MatDialogRef,
    );
  private readonly authService = inject(Auth);

  protected readonly descriptionId = ORGANIZATION_SELECTION_DESCRIPTION_ID;
  protected readonly organizations =
    inject<OrganizationSelectionDialogData>(MAT_DIALOG_DATA).organizations;
  protected readonly selected = signal<OrganizationMembershipSummary | null>(null);

  protected onSelectionChange(event: MatRadioChange<OrganizationMembershipSummary>): void {
    this.selected.set(event.value);
  }

  protected organizationDetails(organization: OrganizationMembershipSummary): string {
    return [organization.organizationTypeName, organization.city].filter(Boolean).join(' · ');
  }

  protected continue(): void {
    this.dialogRef.close(this.selected());
  }

  protected logout(): void {
    this.dialogRef.close(null);
    this.authService.logout();
  }
}
