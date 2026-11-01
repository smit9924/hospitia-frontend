import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CurrencyUnit } from './currency-unit';

describe('CurrencyUnit', () => {
  let service: CurrencyUnit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CurrencyUnit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
