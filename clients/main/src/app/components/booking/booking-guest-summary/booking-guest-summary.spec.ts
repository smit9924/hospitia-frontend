import { TestBed } from '@angular/core/testing';
import { Gender, IdProofType } from '../../../types/enums/booking';
import { BookingGuestInput } from '../../../types/interfaces/booking';
import { ageOn, todayIsoDate } from '../../../utils/iso-date';
import { BookingGuestSummary } from './booking-guest-summary';

const guest: BookingGuestInput = {
  firstName: 'Asha',
  lastName: 'Rao',
  gender: Gender.FEMALE,
  dateOfBirth: '1990-05-17',
  phone: '+91 98450 12345',
  email: 'asha@example.org',
  idProofType: IdProofType.AADHAAR,
  idProofNumber: '••••••••1234',
  address: 'Pune',
  nationality: 'Indian',
};

describe('BookingGuestSummary', () => {
  const render = async (isPrimary: boolean) => {
    await TestBed.configureTestingModule({ imports: [BookingGuestSummary] }).compileComponents();
    const fixture = TestBed.createComponent(BookingGuestSummary);
    fixture.componentRef.setInput('guest', guest);
    fixture.componentRef.setInput('isPrimary', isPrimary);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('shows the name, details, ID proof as given and origin', async () => {
    const element = await render(false);
    const age = ageOn(guest.dateOfBirth, todayIsoDate());

    expect(element.textContent).toContain('Asha Rao');
    expect(element.textContent).toContain(
      `Female · ${age} years · +91 98450 12345 · asha@example.org`,
    );
    expect(element.textContent).toContain('Aadhaar ••••••••1234');
    expect(element.textContent).toContain('Indian · Pune');
    expect(element.textContent).not.toContain('Primary');
  });

  it('marks the primary guest', async () => {
    const element = await render(true);

    expect(element.querySelector('.status-chip')?.textContent).toContain('Primary');
  });
});
