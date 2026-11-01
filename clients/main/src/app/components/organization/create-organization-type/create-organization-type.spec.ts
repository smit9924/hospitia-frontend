import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateOrganizationType } from './create-organization-type';

describe('CreateOrganizationType', () => {
  let component: CreateOrganizationType;
  let fixture: ComponentFixture<CreateOrganizationType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrganizationType],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
