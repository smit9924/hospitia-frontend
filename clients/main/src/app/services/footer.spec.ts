import { TestBed } from '@angular/core/testing';

import { Footer } from './footer';

describe('Footer', () => {
  let service: Footer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Footer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
