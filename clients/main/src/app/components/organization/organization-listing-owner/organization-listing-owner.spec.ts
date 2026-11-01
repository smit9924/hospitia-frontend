import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationListingOwner } from './organization-listing-owner';

describe('OrganizationListingOwner', () => {
  let component: OrganizationListingOwner;
  let fixture: ComponentFixture<OrganizationListingOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationListingOwner],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationListingOwner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
