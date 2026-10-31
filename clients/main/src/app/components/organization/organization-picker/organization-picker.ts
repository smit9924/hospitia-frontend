import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Organization } from '../../../services/organization/organization';
import { OrganizationReference } from '../../../types/interfaces/room-amenity';

/** How many matching organizations are offered at a time. */
const ORGANIZATION_SUGGESTION_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Searchable organization picker for admins (who are not tied to an
 * organization). Suggestions are searched on the server, so it scales to
 * any number of organizations.
 *
 * The parent owns the value through `control`: it holds the selected
 * organization, or null while nothing is selected (typing clears the
 * selection until an option is picked). Validators such as
 * `Validators.required` belong on that control.
 */
@Component({
  selector: 'app-organization-picker',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './organization-picker.html',
})
export class OrganizationPicker implements OnInit {
  private readonly organizationService = inject(Organization);
  private readonly destroyRef = inject(DestroyRef);

  /** Holds the selected organization; null when none is selected. */
  readonly control = input.required<FormControl<OrganizationReference | null>>();
  readonly label = input($localize`Organization`);
  readonly placeholder = input($localize`Search organizations`);
  readonly hint = input('');
  readonly requiredErrorText = input($localize`Organization is required`);

  /** Text typed in the input, or the picked organization (shown by name). */
  protected readonly searchControl = new FormControl<string | OrganizationReference>('', {
    nonNullable: true,
  });
  protected readonly organizationOptions = signal<OrganizationReference[]>([]);
  protected readonly isSearching = signal(false);

  /** Marks the field as required (asterisk) when the parent control requires a value. */
  protected isRequired(): boolean {
    return this.control().hasValidator(Validators.required);
  }

  /** Shows the error from the parent control, which owns the validators. */
  protected readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.control().invalid && this.control().touched,
  };

  ngOnInit(): void {
    this.syncInputWithControl();
    this.searchOrganizationsAsUserTypes();
  }

  protected displayOrganizationName(value: string | OrganizationReference | null): string {
    if (!value) {
      return '';
    }
    return typeof value === 'string' ? value : value.name;
  }

  protected onOrganizationSelected(event: MatAutocompleteSelectedEvent): void {
    const organization = event.option.value as OrganizationReference;
    this.control().setValue(organization);
    this.control().markAsDirty();
  }

  protected onInputBlur(): void {
    this.control().markAsTouched();
  }

  /** Mirrors the parent control's value and disabled state into the visible input. */
  private syncInputWithControl(): void {
    const control = this.control();
    const applyControlState = (): void => {
      if (control.value) {
        this.searchControl.setValue(control.value, { emitEvent: false });
      }
      if (control.disabled && this.searchControl.enabled) {
        this.searchControl.disable({ emitEvent: false });
      } else if (control.enabled && this.searchControl.disabled) {
        this.searchControl.enable({ emitEvent: false });
      }
    };

    applyControlState();
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(applyControlState);
    control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(applyControlState);
  }

  /** Clears the selection while the user types, then loads matching organizations. */
  private searchOrganizationsAsUserTypes(): void {
    this.searchControl.valueChanges
      .pipe(
        tap((value) => {
          if (typeof value === 'string' && this.control().value !== null) {
            this.control().setValue(null);
          }
        }),
        map((value) => (typeof value === 'string' ? value.trim() : value.name)),
        startWith(''),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((searchTerm) => this.findOrganizations(searchTerm)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((organizations) => this.organizationOptions.set(organizations));
  }

  private findOrganizations(searchTerm: string): Observable<OrganizationReference[]> {
    this.isSearching.set(true);
    return this.organizationService
      .listAdmin({
        searchTerm,
        pageSize: ORGANIZATION_SUGGESTION_LIMIT,
        sortBy: 'name',
        sortDirection: 'asc',
        pageNumber: 1,
      })
      .pipe(
        map((response) =>
          response.items.map((organization) => ({
            guid: organization.guid,
            name: organization.name,
          })),
        ),
        // A failed search just offers nothing; the user can type again.
        catchError(() => of([])),
        finalize(() => this.isSearching.set(false)),
      );
  }
}
