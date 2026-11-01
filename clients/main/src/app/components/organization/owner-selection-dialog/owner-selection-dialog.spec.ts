import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { OwnerSelectionDialog } from './owner-selection-dialog';

describe('OwnerSelectionDialog', () => {
  let component: OwnerSelectionDialog;
  let fixture: ComponentFixture<OwnerSelectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerSelectionDialog],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerSelectionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
