import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RoomType } from './room-type';

describe('RoomType', () => {
  let service: RoomType;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoomType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
