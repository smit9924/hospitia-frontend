import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Organization } from '../../../services/organization/organization';
import { Profile } from '../../../services/profile';
import { SidebarNavigation } from '../../../services/sidebar-navigation/sidebar-navigation';
import { UserType } from '../../../types/enums/auth';
import { UserProfileModel } from '../../../types/models/users/user-profile-model';
import { RoomFloorChart } from '../../room/room-floor-chart/room-floor-chart';
import { DashboardOverview } from './dashboard-overview';

@Component({ selector: 'app-room-floor-chart', template: '' })
class RoomFloorChartStub {}

describe('DashboardOverview', () => {
  const userProfile = signal(new UserProfileModel({ firstName: 'Asha', role: UserType.ADMIN }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOverview],
      providers: [
        provideRouter([]),
        {
          provide: Profile,
          useValue: { userProfile: userProfile },
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
    })
      .overrideComponent(DashboardOverview, {
        remove: { imports: [RoomFloorChart] },
        add: { imports: [RoomFloorChartStub] },
      })
      .compileComponents();
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

  it.each([UserType.OWNER, UserType.MANAGER])(
    'shows the rooms by floor chart to role %s',
    async (role) => {
      userProfile.set(new UserProfileModel({ firstName: 'Asha', role }));
      const fixture = TestBed.createComponent(DashboardOverview);
      await fixture.whenStable();

      expect(
        (fixture.nativeElement as HTMLElement).querySelector('app-room-floor-chart'),
      ).not.toBeNull();
    },
  );

  it('does not show the chart to admins', async () => {
    userProfile.set(new UserProfileModel({ firstName: 'Asha', role: UserType.ADMIN }));
    const fixture = TestBed.createComponent(DashboardOverview);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('app-room-floor-chart')).toBeNull();
  });
});
