import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingCancelDialog } from './booking-cancel-dialog';

describe('BookingCancelDialog', () => {
  const dialogRef = { close: vi.fn() };
  let component: BookingCancelDialog;
  let element: HTMLElement;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [BookingCancelDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { reference: 'BK-2026-000001' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(BookingCancelDialog);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('names the booking', () => {
    expect(element.querySelector('h2')?.textContent).toContain('Cancel booking BK-2026-000001?');
  });

  it('confirms with the trimmed reason', () => {
    component['reason'].setValue('  Guest request ');
    component['confirm']();

    expect(dialogRef.close).toHaveBeenCalledWith({ reason: 'Guest request' });
  });

  it('confirms without a reason', () => {
    component['confirm']();

    expect(dialogRef.close).toHaveBeenCalledWith({ reason: null });
  });

  it('closes with null when the booking is kept', () => {
    component['close']();

    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });
});
