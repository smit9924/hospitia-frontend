import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Organization } from '../../../services/organization/organization';
import { Profile } from '../../../services/profile';
import { SidebarNavigation } from '../../../services/sidebar-navigation/sidebar-navigation';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { DashboardOverview } from './dashboard-overview';

describe('DashboardOverview', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOverview],
      providers: [
        provideRouter([]),
        {
          provide: Profile,
          useValue: { userProfile: signal(new UserProfileModel({ firstName: 'Asha' })) },
        },
        {
          provide: Organization,
          useValue: { activeOrganization: signal({ name: 'Sunrise Guest House' }) },
        },
        {
          provide: SidebarNavigation,
          useValue: {
            navigationGroups: signal([
              {
                label: 'Overview',
                links: [
                  {
                    label: 'Dashboard',
                    description: '',
                    icon: 'dashboard',
                    route: '/d',
                    isActive: true,
                  },
                ],
              },
              {
                label: 'Property',
                links: [
                  {
                    label: 'Room types',
                    description: 'Rooms you offer.',
                    icon: 'bed',
                    route: '/rt',
                    isActive: false,
                  },
                ],
              },
            ]),
            footerLinks: signal([
              {
                label: 'Settings',
                description: 'Preferences.',
                icon: 'settings',
                route: '/s',
                isActive: false,
              },
            ]),
          },
        },
      ],
    }).compileComponents();
  });

  it('greets the user and names the active organization', async () => {
    const fixture = TestBed.createComponent(DashboardOverview);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Welcome back, Asha');
    expect(element.querySelector('.page-header-description')?.textContent).toContain(
      'Sunrise Guest House',
    );
  });

  it('shows a shortcut for every page except the dashboard itself', async () => {
    const fixture = TestBed.createComponent(DashboardOverview);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const labels = Array.from(
      element.querySelectorAll('.dashboard-shortcut .font-weight-bold'),
    ).map((label) => label.textContent?.trim());

    expect(labels).toEqual(['Room types', 'Settings']);
  });
});
