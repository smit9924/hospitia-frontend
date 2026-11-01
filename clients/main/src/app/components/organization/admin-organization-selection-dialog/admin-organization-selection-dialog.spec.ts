import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { AdminOrganizationSelectionDialog } from './admin-organization-selection-dialog';

describe('AdminOrganizationSelectionDialog', () => {
  let component: AdminOrganizationSelectionDialog;
  let fixture: ComponentFixture<AdminOrganizationSelectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrganizationSelectionDialog],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { selectedOrganization: null } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrganizationSelectionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
