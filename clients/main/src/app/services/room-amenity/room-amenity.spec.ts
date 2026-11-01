import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RoomAmenity } from './room-amenity';

describe('RoomAmenity', () => {
  let service: RoomAmenity;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoomAmenity);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
