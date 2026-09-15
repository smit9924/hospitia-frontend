import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateOwner } from './create-owner';

describe('CreateOwner', () => {
  let component: CreateOwner;
  let fixture: ComponentFixture<CreateOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOwner],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOwner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
