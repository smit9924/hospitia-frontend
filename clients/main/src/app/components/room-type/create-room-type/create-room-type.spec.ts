import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateRoomType } from './create-room-type';

describe('CreateRoomType', () => {
  let component: CreateRoomType;
  let fixture: ComponentFixture<CreateRoomType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomType],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
