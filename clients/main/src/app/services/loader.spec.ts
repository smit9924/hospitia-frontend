import { TestBed } from '@angular/core/testing';

import { Loader } from './loader';

describe('LoaderService', () => {
  let service: Loader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shows and hides the generic loader', () => {
    service.showLoader();
    expect(service.loading()).toBe(true);

    service.hideLoader();
    expect(service.loading()).toBe(false);
  });

  it('shows and hides the account setup loader independently', () => {
    service.showAccountSetupLoader();
    expect(service.accountSetupLoading()).toBe(true);
    expect(service.loading()).toBe(false);

    service.hideAccountSetupLoader();
    expect(service.accountSetupLoading()).toBe(false);
  });
});
