import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateManager } from './create-manager';

describe('CreateManager', () => {
  let component: CreateManager;
  let fixture: ComponentFixture<CreateManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateManager],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
