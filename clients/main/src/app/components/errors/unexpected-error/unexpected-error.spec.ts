import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnexpectedError } from './unexpected-error';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';

describe('UnexpectedError', () => {
  let fixture: ComponentFixture<UnexpectedError>;
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
      imports: [UnexpectedError],
      providers: [
        { provide: Profile, useValue: profileService },
        { provide: Auth, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnexpectedError);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('tells the user they are signed in but the workspace did not load', () => {
    expect(element.querySelector('h1')?.textContent).toContain('Something went wrong');
    expect(element.textContent).toContain("You're signed in, but we couldn't load your workspace.");
  });

  it('goes home again on retry, which loads the workspace again', async () => {
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
