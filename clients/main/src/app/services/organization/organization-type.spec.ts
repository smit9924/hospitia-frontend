import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrganizationType } from './organization-type';

describe('OrganizationType', () => {
  let service: OrganizationType;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrganizationType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
