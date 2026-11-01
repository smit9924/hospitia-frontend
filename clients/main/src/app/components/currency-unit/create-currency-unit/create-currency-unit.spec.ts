import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateCurrencyUnit } from './create-currency-unit';

describe('CreateCurrencyUnit', () => {
  let component: CreateCurrencyUnit;
  let fixture: ComponentFixture<CreateCurrencyUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCurrencyUnit],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCurrencyUnit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
