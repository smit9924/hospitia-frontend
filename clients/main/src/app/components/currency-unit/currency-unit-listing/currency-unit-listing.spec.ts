import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CurrencyUnitListing } from './currency-unit-listing';

describe('CurrencyUnitListing', () => {
  let component: CurrencyUnitListing;
  let fixture: ComponentFixture<CurrencyUnitListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyUnitListing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyUnitListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
