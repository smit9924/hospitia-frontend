import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Auth } from './auth';
import { localStorageKeys } from '../data/localstorage-keys';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('removes the active organization on logout', () => {
    localStorage.setItem(localStorageKeys.activeOrganization, JSON.stringify({ userGuid: 'u' }));

    service.logout();

    expect(localStorage.getItem(localStorageKeys.activeOrganization)).toBeNull();
  });
});
