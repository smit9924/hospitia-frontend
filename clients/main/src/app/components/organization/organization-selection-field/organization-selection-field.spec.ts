import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { OrganizationSelectionField } from './organization-selection-field';

describe('OrganizationSelectionField', () => {
  let component: OrganizationSelectionField;
  let fixture: ComponentFixture<OrganizationSelectionField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationSelectionField],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationSelectionField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl(null));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
