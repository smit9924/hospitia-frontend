import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { appRoutes } from '../../data/app-routes';
import { UserType } from '../../types/enums/auth';
import { UserProfileModel } from '../../types/models/users/user-profile-model';
import { Organization } from '../organization/organization';
import { Profile } from '../profile';
import { SidebarNavigation } from './sidebar-navigation';

@Component({ template: '' })
class EmptyRouteTarget {}

describe('SidebarNavigation', () => {
  const userProfile = signal<UserProfileModel | null>(null);

  const linkLabels = (service: SidebarNavigation) =>
    service.navigationGroups().flatMap((group) => group.links.map((link) => link.label));

  const setup = (role: UserType) => {
    userProfile.set(new UserProfileModel({ guid: 'user-a', role, isEmailVerified: true }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: EmptyRouteTarget }]),
        {
          provide: Profile,
          useValue: {
            userProfile,
            getDefaultHomeRouteForUser: async () => appRoutes.ownerDashboard,
          },
        },
        {
          provide: Organization,
          useValue: {
            getDefaultOrganizationListingRouteForUser: () => appRoutes.organizationListingOwner,
          },
        },
      ],
    });
    return TestBed.inject(SidebarNavigation);
  };

  it('shows admins every admin page, including currency units and organization types', () => {
    const labels = linkLabels(setup(UserType.ADMIN));

    expect(labels).toEqual(
      expect.arrayContaining(['Currency units', 'Organization types', 'Admins', 'Owners']),
    );
  });

  it('hides admin-only pages from owners', () => {
    const labels = linkLabels(setup(UserType.OWNER));

    expect(labels).toEqual(
      expect.arrayContaining(['Room types', 'Room amenities', 'Managers', 'Customers']),
    );
    expect(labels).not.toContain('Currency units');
    expect(labels).not.toContain('Admins');
  });

  it('shows customers only the dashboard group and drops empty groups', () => {
    const service = setup(UserType.CUSTOMER);

    expect(service.navigationGroups().map((group) => group.label)).toEqual(['Overview']);
    expect(service.footerLinks().map((link) => link.label)).toEqual(['Settings']);
  });

  it('resolves role-dependent routes', async () => {
    const service = setup(UserType.OWNER);
    await TestBed.inject(Router).navigateByUrl('/');
    await Promise.resolve();

    const organizations = service
      .navigationGroups()
      .flatMap((group) => group.links)
      .find((link) => link.label === 'Organizations');

    expect(organizations?.route).toBe(appRoutes.organizationListingOwner);
  });

  it('marks the link of the current page, including its create/edit pages', async () => {
    const service = setup(UserType.OWNER);

    await TestBed.inject(Router).navigateByUrl(`${appRoutes.createRoomType}?guid=abc`);

    const activeLinks = service
      .navigationGroups()
      .flatMap((group) => group.links)
      .filter((link) => link.isActive)
      .map((link) => link.label);
    expect(activeLinks).toEqual(['Room types']);
  });
});
