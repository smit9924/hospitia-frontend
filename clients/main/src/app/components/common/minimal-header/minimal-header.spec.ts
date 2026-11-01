import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MinimalHeader } from './minimal-header';

describe('MinimalHeader', () => {
  let component: MinimalHeader;
  let fixture: ComponentFixture<MinimalHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalHeader],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinimalHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
