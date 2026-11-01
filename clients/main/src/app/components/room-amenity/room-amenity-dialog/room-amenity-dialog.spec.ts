import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { RoomAmenityDialog } from './room-amenity-dialog';

describe('RoomAmenityDialog', () => {
  let component: RoomAmenityDialog;
  let fixture: ComponentFixture<RoomAmenityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAmenityDialog],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { organization: null } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAmenityDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
