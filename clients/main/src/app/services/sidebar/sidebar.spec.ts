import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { localStorageKeys } from '../../data/localstorage-keys';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let service: Sidebar;
  let breakpointState: BehaviorSubject<BreakpointState>;

  const createService = (isCompactViewport: boolean) => {
    breakpointState = new BehaviorSubject<BreakpointState>({
      matches: isCompactViewport,
      breakpoints: {},
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => breakpointState.asObservable(),
            isMatched: () => isCompactViewport,
          },
        },
      ],
    });
    service = TestBed.inject(Sidebar);
  };

  beforeEach(() => localStorage.clear());

  it('keeps the sidebar open on wide screens and collapses it to an icon rail on toggle', () => {
    createService(false);

    expect(service.sidenavMode()).toBe('side');
    expect(service.isSidenavOpened()).toBe(true);
    expect(service.showsIconRail()).toBe(false);

    service.toggle();

    expect(service.isSidenavOpened()).toBe(true);
    expect(service.showsIconRail()).toBe(true);
    expect(service.isNavigationExpanded()).toBe(false);
  });

  it('remembers the icon rail choice in local storage', () => {
    createService(false);

    service.toggle();

    expect(localStorage.getItem(localStorageKeys.sidebarCollapsedToRail)).toBe('true');
  });

  it('uses a closed overlay drawer on compact screens that the toggle opens', () => {
    createService(true);

    expect(service.sidenavMode()).toBe('over');
    expect(service.isSidenavOpened()).toBe(false);

    service.toggle();

    expect(service.isSidenavOpened()).toBe(true);
    expect(service.isNavigationExpanded()).toBe(true);
    expect(service.showsIconRail()).toBe(false);
  });

  it('closes the drawer when the sidenav closes itself (backdrop or Escape)', () => {
    createService(true);
    service.toggle();

    service.syncSidenavOpenedState(false);

    expect(service.isDrawerOpen()).toBe(false);
  });
});
