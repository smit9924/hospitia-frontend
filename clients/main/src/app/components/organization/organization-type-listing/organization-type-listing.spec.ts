import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationTypeListing } from './organization-type-listing';

describe('OrganizationTypeListing', () => {
  let component: OrganizationTypeListing;
  let fixture: ComponentFixture<OrganizationTypeListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationTypeListing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationTypeListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
