import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateRoomAmenity } from './create-room-amenity';

describe('CreateRoomAmenity', () => {
  let component: CreateRoomAmenity;
  let fixture: ComponentFixture<CreateRoomAmenity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomAmenity],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomAmenity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
