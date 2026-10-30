import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSetupFailed } from './account-setup-failed';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

describe('AccountSetupFailed', () => {
  let fixture: ComponentFixture<AccountSetupFailed>;
  let element: HTMLElement;
  const profileService = { redirectToDefaultHome: vi.fn() };
  const authService = { logout: vi.fn() };

  const buttonByText = (text: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === text,
    )!;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AccountSetupFailed],
      providers: [
        { provide: Profile, useValue: profileService },
        { provide: Auth, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSetupFailed);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('explains that the account is not ready yet', () => {
    expect(element.querySelector('h1')?.textContent).toContain(
      "We couldn't finish setting up your account",
    );
  });

  it('goes home again on retry, which re-runs the account setup check', async () => {
    let finishRedirect!: () => void;
    profileService.redirectToDefaultHome.mockReturnValue(
      new Promise<void>((resolve) => (finishRedirect = resolve)),
    );

    buttonByText('Try again').click();
    fixture.detectChanges();

    expect(profileService.redirectToDefaultHome).toHaveBeenCalledOnce();
    expect(buttonByText('Try again').disabled).toBe(true);

    finishRedirect();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(buttonByText('Try again').disabled).toBe(false);
  });

  it('logs the user out', () => {
    buttonByText('Log out').click();

    expect(authService.logout).toHaveBeenCalledOnce();
  });
});
