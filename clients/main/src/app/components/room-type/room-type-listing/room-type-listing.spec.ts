import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RoomTypeListing } from './room-type-listing';

describe('RoomTypeListing', () => {
  let component: RoomTypeListing;
  let fixture: ComponentFixture<RoomTypeListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypeListing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomTypeListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
