import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationListingAdmin } from './organization-listing-admin';

describe('OrganizationListingAdmin', () => {
  let component: OrganizationListingAdmin;
  let fixture: ComponentFixture<OrganizationListingAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationListingAdmin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationListingAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
