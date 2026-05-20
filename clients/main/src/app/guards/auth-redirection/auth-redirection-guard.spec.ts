import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authRedirectionGuard } from './auth-redirection-guard';

describe('authRedirectionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authRedirectionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
