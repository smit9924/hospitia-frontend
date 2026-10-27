import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoOrganization } from './no-organization';
import { appRoutes } from '../../../data/app-routes';
import { Auth } from '../../../services/auth';
import { ActiveOrganizationResolver } from '../../../services/organization/active-organization-resolver';
import { Profile } from '../../../services/profile';
import { Snackbar } from '../../../services/snackbar';
import { ActiveOrganizationResolution } from '../../../types/interfaces/organization';

describe('NoOrganization', () => {
  let fixture: ComponentFixture<NoOrganization>;
  let element: HTMLElement;
  const resolver = { resolve: vi.fn<() => Promise<ActiveOrganizationResolution>>() };
  const profileService = { redirectToDefaultHome: vi.fn() };
  const snackbarService = { open: vi.fn() };
  const authService = { logout: vi.fn() };

  const buttonByText = (text: string) =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === text,
    )!;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [NoOrganization],
      providers: [
        { provide: ActiveOrganizationResolver, useValue: resolver },
        { provide: Profile, useValue: profileService },
        { provide: Snackbar, useValue: snackbarService },
        { provide: Auth, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoOrganization);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('continues to the dashboard once the manager is linked', async () => {
    resolver.resolve.mockResolvedValue({ kind: 'resolved' });

    buttonByText('Retry').click();
    await fixture.whenStable();

    expect(profileService.redirectToDefaultHome).toHaveBeenCalled();
    expect(snackbarService.open).not.toHaveBeenCalled();
  });

  it('stays on the page and says so while still unlinked', async () => {
    resolver.resolve.mockResolvedValue({
      kind: 'redirect',
      route: appRoutes.onboardingNoOrganization,
    });

    buttonByText('Retry').click();
    await fixture.whenStable();

    expect(snackbarService.open).toHaveBeenCalled();
    expect(profileService.redirectToDefaultHome).not.toHaveBeenCalled();
    expect(buttonByText('Retry').disabled).toBe(false);
  });

  it('logs out', () => {
    buttonByText('Log out').click();

    expect(authService.logout).toHaveBeenCalled();
  });
});
