import { TestBed } from '@angular/core/testing';

import { DisplayAndAccessibility } from './display-and-accessibility';

describe('DisplayAndAccessibility', () => {
  let service: DisplayAndAccessibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayAndAccessibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
