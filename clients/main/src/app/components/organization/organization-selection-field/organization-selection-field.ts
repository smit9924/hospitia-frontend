import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'rxjs';
import { OrganizationReference } from '../../../types/interfaces/room-amenity';
import {
  AdminOrganizationSelectionDialog,
  AdminOrganizationSelectionDialogData,
} from '../admin-organization-selection-dialog/admin-organization-selection-dialog';

/** Gives every field instance unique element IDs for its ARIA references. */
let nextFieldId = 0;

/**
 * Form field for admins to choose one organization through
 * `AdminOrganizationSelectionDialog`: a "Select organization" button that
 * becomes the chosen organization's name and a "Change organization" button.
 *
 * The parent owns the value through `control` (the chosen organization, or
 * null) and its validators, e.g. `Validators.required`. The form sends
 * `control.value.guid` to the API.
 */
@Component({
  selector: 'app-organization-selection-field',
  imports: [MatButtonModule],
  templateUrl: './organization-selection-field.html',
  styleUrl: './organization-selection-field.scss',
})
export class OrganizationSelectionField implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  /** Holds the chosen organization; null while none is chosen. */
  readonly control = input.required<FormControl<OrganizationReference | null>>();
  readonly label = input($localize`Organization`);
  readonly hint = input('');
  readonly requiredErrorText = input($localize`Organization is required`);

  protected readonly fieldId = `organization-selection-field-${nextFieldId++}`;
  /** Mirrors the control so the template updates when the value or status changes. */
  protected readonly selectedOrganization = signal<OrganizationReference | null>(null);
  protected readonly showRequiredError = signal(false);
  protected readonly isRequired = signal(false);
  protected readonly isDisabled = signal(false);

  ngOnInit(): void {
    const control = this.control();
    this.syncStateFromControl();
    merge(control.valueChanges, control.statusChanges, control.events)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncStateFromControl());
  }

  /** Opens the organization list; "Add" sets the control, "Cancel" keeps the current choice. */
  protected openOrganizationSelection(): void {
    const control = this.control();
    this.matDialog
      .open<
        AdminOrganizationSelectionDialog,
        AdminOrganizationSelectionDialogData,
        OrganizationReference | null
      >(AdminOrganizationSelectionDialog, {
        data: { selectedOrganization: control.value },
        width: '720px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((organization) => {
        if (organization) {
          control.setValue(organization);
          control.markAsDirty();
        }
        // A closed dialog counts as a visit: show "required" if nothing is chosen.
        control.markAsTouched();
        this.syncStateFromControl();
      });
  }

  private syncStateFromControl(): void {
    const control = this.control();
    this.selectedOrganization.set(control.value);
    this.isRequired.set(control.hasValidator(Validators.required));
    this.isDisabled.set(control.disabled);
    this.showRequiredError.set(control.touched && control.hasError('required'));
  }
}
