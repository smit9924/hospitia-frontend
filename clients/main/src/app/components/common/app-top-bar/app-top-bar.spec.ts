import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '../../../services/auth';
import { DisplayAndAccessibility } from '../../../services/display-and-accessibility/display-and-accessibility';
import { Profile } from '../../../services/profile';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { ThemePreference, ThemeType } from '../../../types/enums/common';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { AppTopBar } from './app-top-bar';

describe('AppTopBar', () => {
  const sidebar = {
    toggle: vi.fn(),
    isCompactViewport: signal(false),
    isCollapsedToRail: signal(false),
    isNavigationExpanded: signal(true),
  };
  const displayAndAccessibility = { activeTheme: signal(ThemeType.LIGHT), setTheme: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppTopBar],
      providers: [
        provideRouter([]),
        { provide: Sidebar, useValue: sidebar },
        { provide: DisplayAndAccessibility, useValue: displayAndAccessibility },
        { provide: Auth, useValue: { logout: vi.fn() } },
        {
          provide: Profile,
          useValue: {
            userProfile: signal(
              new UserProfileModel({
                firstName: 'Asha',
                lastName: 'Rao',
                email: 'asha@example.org',
              }),
            ),
          },
        },
      ],
    }).compileComponents();
  });

  const render = async () => {
    const fixture = TestBed.createComponent(AppTopBar);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('toggles the sidebar and reports whether navigation is expanded', async () => {
    const element = await render();
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-controls="app-sidebar"]')!;

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    expect(sidebar.toggle).toHaveBeenCalled();
  });

  it('switches to the dark theme from the light theme', async () => {
    const element = await render();

    element.querySelector<HTMLButtonElement>('button[aria-label="Switch to dark theme"]')!.click();

    expect(displayAndAccessibility.setTheme).toHaveBeenCalledWith(ThemePreference.DARK);
  });

  it("shows the signed-in user's initials", async () => {
    const element = await render();

    expect(element.querySelector('.app-top-bar-avatar')?.textContent?.trim()).toBe('AR');
  });
});
