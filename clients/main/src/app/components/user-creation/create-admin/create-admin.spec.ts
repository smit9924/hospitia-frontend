import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateAdmin } from './create-admin';

describe('CreateAdmin', () => {
  let component: CreateAdmin;
  let fixture: ComponentFixture<CreateAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAdmin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
