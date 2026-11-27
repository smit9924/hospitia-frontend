import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Dialog } from '../../../services/dialog';
import { Gender, IdProofType } from '../../../types/enums/booking';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { BookingGuestsSection } from './booking-guests-section';

const guest = (firstName: string, primary = false): BookingGuestInput => ({
  firstName,
  lastName: 'Rao',
  gender: Gender.FEMALE,
  dateOfBirth: '1990-05-17',
  phone: primary ? '+91 98450 12345' : null,
  email: null,
  idProofType: primary ? IdProofType.AADHAAR : null,
  idProofNumber: primary ? '123412341234' : null,
  address: null,
  nationality: null,
});

describe('BookingGuestsSection', () => {
  let fixture: ComponentFixture<BookingGuestsSection>;
  let element: HTMLElement;
  const matDialog = { open: vi.fn() };
  const dialogService = { openConfirmDialog: vi.fn() };

  const render = async (
    capacity: number | null,
    primary: BookingGuestInput | null,
    secondary: BookingGuestInput[],
  ) => {
    await TestBed.configureTestingModule({
      imports: [BookingGuestsSection],
      providers: [
        { provide: MatDialog, useValue: matDialog },
        { provide: Dialog, useValue: dialogService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingGuestsSection);
    fixture.componentRef.setInput('capacity', capacity);
    fixture.componentRef.setInput('roomNumber', '201');
    fixture.componentRef.setInput('primaryGuest', primary);
    fixture.componentRef.setInput('secondaryGuests', secondary);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };
  const button = (label: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find((item) =>
      item.textContent?.includes(label),
    )!;
  const capacityText = () => element.querySelector('#guest-capacity-status')?.textContent?.trim();

  beforeEach(() => vi.clearAllMocks());

  it('asks for a room before guests can be added', async () => {
    await render(null, null, []);

    expect(button('Add guest').disabled).toBe(true);
    expect(capacityText()).toBe('Choose a room first.');
  });

  it('disables "Add guest" once the room is full', async () => {
    await render(2, guest('Asha', true), [guest('Ravi')]);

    expect(button('Add guest').disabled).toBe(true);
    expect(capacityText()).toBe('Room capacity reached (2 of 2)');
  });

  it('adds a secondary guest from the dialog', async () => {
    matDialog.open.mockReturnValue({ afterClosed: () => of(guest('Meera')) });
    await render(3, guest('Asha', true), []);

    button('Add guest').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.secondaryGuests().map((item) => item.firstName)).toEqual([
      'Meera',
    ]);
    expect(capacityText()).toBe('Guests: 2 of 3');
  });

  it('removes a secondary guest after confirmation', async () => {
    dialogService.openConfirmDialog.mockReturnValue({ afterClosed: () => of(true) });
    await render(3, guest('Asha', true), [guest('Ravi'), guest('Meera')]);

    element.querySelector<HTMLButtonElement>('button[aria-label="Remove Ravi Rao"]')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.secondaryGuests().map((item) => item.firstName)).toEqual([
      'Meera',
    ]);
  });

  it('explains how many guests to remove when a smaller room is chosen', async () => {
    await render(2, guest('Asha', true), [guest('Ravi'), guest('Meera')]);

    expect(capacityText()).toContain('Room 201 fits 2 guests. Remove 1 guest(s)');
  });

  it('flags a missing primary guest after a save attempt', async () => {
    await render(2, null, []);
    fixture.componentRef.setInput('showErrors', true);
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Add the primary guest.',
    );
  });
});
