import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RoomAmenityListing } from './room-amenity-listing';

describe('RoomAmenityListing', () => {
  let component: RoomAmenityListing;
  let fixture: ComponentFixture<RoomAmenityListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAmenityListing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAmenityListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
