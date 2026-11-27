import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Gender, IdProofType } from '../../../types/enums/booking';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { GuestDetailsDialog, GuestDetailsDialogData } from './guest-details-dialog';

const existingGuest: BookingGuestInput = {
  guid: 'guest-1',
  firstName: 'Asha',
  lastName: 'Rao',
  gender: Gender.FEMALE,
  dateOfBirth: '1990-05-17',
  phone: '+91 98450 12345',
  email: null,
  idProofType: IdProofType.AADHAAR,
  idProofNumber: '123412341234',
  address: null,
  nationality: 'Indian',
};

describe('GuestDetailsDialog', () => {
  const dialogRef = { close: vi.fn() };
  let component: GuestDetailsDialog;
  let element: HTMLElement;

  const render = async (data: GuestDetailsDialogData) => {
    await TestBed.configureTestingModule({
      imports: [GuestDetailsDialog],
      providers: [
        provideNativeDateAdapter(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(GuestDetailsDialog);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  };
  const form = () => component['guestForm'];
  const submit = () => component['submit']();
  const fillRequired = () =>
    form().patchValue({
      firstName: '  Ravi ',
      lastName: 'Rao',
      gender: Gender.MALE,
      dateOfBirth: new Date(1988, 0, 9),
    });

  beforeEach(() => vi.clearAllMocks());

  it('requires phone and ID proof for the primary guest', async () => {
    await render({ isPrimary: true });
    fillRequired();

    submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(form().controls.phone.hasError('required')).toBe(true);
    expect(form().controls.idProofType.hasError('required')).toBe(true);
    expect(element.querySelector('h2')?.textContent).toContain('Primary guest');
  });

  it('closes with a trimmed guest, an ISO birth date and nulls for empty fields', async () => {
    await render({ isPrimary: false });
    fillRequired();

    submit();

    expect(dialogRef.close).toHaveBeenCalledWith({
      firstName: 'Ravi',
      lastName: 'Rao',
      gender: Gender.MALE,
      dateOfBirth: '1988-01-09',
      phone: null,
      email: null,
      idProofType: null,
      idProofNumber: null,
      address: null,
      nationality: null,
    });
  });

  it('refuses an ID proof type without a number for a secondary guest', async () => {
    await render({ isPrimary: false });
    fillRequired();
    form().controls.idProofType.setValue(IdProofType.PASSPORT);

    submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(form().hasError('idProofPair')).toBe(true);
  });

  it('refuses an invalid phone number', async () => {
    await render({ isPrimary: false });
    fillRequired();
    form().controls.phone.setValue('98450-ABC');

    submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('edits a guest keeping its identity', async () => {
    await render({ guest: existingGuest, isPrimary: true });
    form().controls.lastName.setValue('Rao-Kumar');

    submit();

    expect(dialogRef.close).toHaveBeenCalledWith({ ...existingGuest, lastName: 'Rao-Kumar' });
    expect(element.textContent).toContain('Save');
  });
});
