import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from '../../../services/sidebar/sidebar';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { AppTopBar } from '../app-top-bar/app-top-bar';
import { AppShell } from './app-shell';

@Component({ selector: 'app-sidebar', template: '' })
class SidebarStub {}

@Component({ selector: 'app-top-bar', template: '' })
class TopBarStub {}

@Component({
  imports: [AppShell],
  template: `
    <app-shell [showsNavigation]="showsNavigation()">
      <div appShellPublicHeader class="public-header-probe">Public header</div>
      <p class="page-probe">Page</p>
    </app-shell>
  `,
})
class AppShellHost {
  readonly showsNavigation = signal(true);
}

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellHost],
      providers: [
        provideRouter([]),
        {
          provide: Sidebar,
          useValue: {
            showsIconRail: signal(false),
            sidenavMode: signal('side'),
            isSidenavOpened: signal(true),
            syncSidenavOpenedState: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(AppShell, {
        remove: { imports: [AppSidebar, AppTopBar] },
        add: { imports: [SidebarStub, TopBarStub] },
      })
      .compileComponents();
  });

  it('renders the sidebar and top bar around the page for signed-in pages', async () => {
    const fixture = TestBed.createComponent(AppShellHost);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('mat-sidenav')).not.toBeNull();
    expect(element.querySelector('app-top-bar')).not.toBeNull();
    expect(element.querySelector('main .page-probe')).not.toBeNull();
  });

  it('shows only the public header and page without navigation', async () => {
    const fixture = TestBed.createComponent(AppShellHost);
    fixture.componentInstance.showsNavigation.set(false);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('mat-sidenav')).toBeNull();
    expect(element.querySelector('app-top-bar')).toBeNull();
    expect(element.querySelector('.public-header-probe')).not.toBeNull();
  });
});
