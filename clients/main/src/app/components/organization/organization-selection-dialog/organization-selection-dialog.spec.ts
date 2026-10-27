import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OrganizationSelectionDialog } from './organization-selection-dialog';
import { Auth } from '../../../services/auth';
import { OrganizationMembershipSummary } from '../../../types/interfaces/organization';

const sunrise: OrganizationMembershipSummary = {
  guid: 'org-sunrise',
  name: 'Sunrise NGO',
  organizationTypeName: 'Guest house',
  city: 'Pune',
};
const hope: OrganizationMembershipSummary = {
  guid: 'org-hope',
  name: 'Hope Foundation',
  organizationTypeName: 'Hostel',
  city: null,
};

describe('OrganizationSelectionDialog', () => {
  let fixture: ComponentFixture<OrganizationSelectionDialog>;
  let element: HTMLElement;
  const dialogRef = { close: vi.fn() };
  const authService = { logout: vi.fn() };

  const buttonByText = (text: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === text,
    )!;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [OrganizationSelectionDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { organizations: [sunrise, hope] } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: Auth, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationSelectionDialog);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('lists each organization with its type and city', () => {
    const options = element.querySelectorAll('mat-radio-button');

    expect(options).toHaveLength(2);
    expect(options[0].textContent).toContain('Sunrise NGO');
    expect(options[0].textContent).toContain('Guest house · Pune');
    expect(options[1].textContent).toContain('Hostel');
  });

  it('enables Continue only after an organization is selected', async () => {
    expect(buttonByText('Continue').disabled).toBe(true);

    element.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1].click();
    await fixture.whenStable();

    expect(buttonByText('Continue').disabled).toBe(false);
    buttonByText('Continue').click();
    expect(dialogRef.close).toHaveBeenCalledWith(hope);
  });

  it('closes without a selection and logs out', () => {
    buttonByText('Log out').click();

    expect(dialogRef.close).toHaveBeenCalledWith(null);
    expect(authService.logout).toHaveBeenCalled();
  });
});
