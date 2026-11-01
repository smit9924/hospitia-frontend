import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OrganizationListingManager } from './organization-listing-manager';

describe('OrganizationListingManager', () => {
  let component: OrganizationListingManager;
  let fixture: ComponentFixture<OrganizationListingManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationListingManager],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationListingManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
