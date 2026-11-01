import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Organization } from '../../../services/organization/organization';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { SidebarNavigation } from '../../../services/sidebar-navigation/sidebar-navigation';
import { ResolvedSidebarNavigationGroup } from '../../../types/interfaces/sidebar-navigation';
import { AppSidebar } from './app-sidebar';

describe('AppSidebar', () => {
  const navigationGroups = signal<ResolvedSidebarNavigationGroup[]>([
    {
      label: 'Property',
      links: [
        { label: 'Room types', description: '', icon: 'bed', route: '/rt', isActive: true },
        { label: 'Room amenities', description: '', icon: 'star', route: '/ra', isActive: false },
      ],
    },
  ]);
  const sidebar = { showsIconRail: signal(false), closeDrawer: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [
        provideRouter([]),
        { provide: Sidebar, useValue: sidebar },
        { provide: SidebarNavigation, useValue: { navigationGroups, footerLinks: signal([]) } },
        {
          provide: Organization,
          useValue: {
            activeOrganization: signal({
              guid: 'org-1',
              name: 'Sunrise Guest House',
              organizationTypeName: 'Guest house',
              city: 'Pune',
            }),
          },
        },
      ],
    }).compileComponents();
  });

  const render = async () => {
    const fixture = TestBed.createComponent(AppSidebar);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('lists the group with its links and marks the current page', async () => {
    const element = await render();
    const links = element.querySelectorAll<HTMLAnchorElement>('.app-sidebar-link');

    expect(element.querySelector('.app-sidebar-group-label')?.textContent?.trim()).toBe('Property');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('shows the active organization with its initials', async () => {
    const element = await render();

    expect(element.querySelector('.app-sidebar-organization-name')?.textContent).toContain(
      'Sunrise Guest House',
    );
    expect(element.querySelector('.app-sidebar-organization-avatar')?.textContent?.trim()).toBe(
      'SG',
    );
  });

  it('closes the drawer after a link is chosen', async () => {
    const element = await render();

    element.querySelector<HTMLAnchorElement>('.app-sidebar-link')!.click();

    expect(sidebar.closeDrawer).toHaveBeenCalled();
  });
});
