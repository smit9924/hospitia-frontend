import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CreateOrganization } from './create-organization';
import { OrganizationType } from '../../../services/organization/organization-type';

describe('CreateOrganization postal code', () => {
  let fixture: ComponentFixture<CreateOrganization>;
  let element: HTMLElement;

  const input = () =>
    element.querySelector<HTMLInputElement>('input[formControlName="postalCode"]')!;

  const enterPostalCode = async (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    input().dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const errorText = () => element.querySelector('mat-error')?.textContent?.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrganization],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: {}, queryParamMap: convertToParamMap({}) } },
        },
        {
          provide: OrganizationType,
          useValue: { list: () => of({ items: [] }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganization);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('limits the field to 7 characters and a numeric keypad', () => {
    expect(input().getAttribute('maxlength')).toBe('7');
    expect(input().getAttribute('inputmode')).toBe('numeric');
  });

  it.each(['1', '120', '1234567'])('accepts %s', async (value) => {
    await enterPostalCode(value);

    expect(errorText()).toBeUndefined();
    expect(input().getAttribute('aria-invalid')).toBe('false');
  });

  it.each(['abc', '12a', '12 34', '12-34', '١٢٣', '12345678', '0', '0123456'])(
    'rejects %s',
    async (value) => {
      await enterPostalCode(value);

      expect(errorText()).toBe(
        'Postal code must be a number of up to 7 digits and cannot start with 0',
      );
      expect(input().getAttribute('aria-invalid')).toBe('true');
    },
  );

  it('sends the postal code as a number', async () => {
    await enterPostalCode('1234567');

    expect(fixture.componentInstance['buildAddressInput']().postalCode).toBe(1234567);
  });

  it('still reports an empty value as required', async () => {
    await enterPostalCode('');

    expect(errorText()).toBe('Postal code is required');
  });
});
