import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RoomAmenityForm } from './room-amenity-form';

describe('RoomAmenityForm', () => {
  let component: RoomAmenityForm;
  let fixture: ComponentFixture<RoomAmenityForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAmenityForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAmenityForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
