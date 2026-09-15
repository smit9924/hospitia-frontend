import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayAndAccessibility } from './display-and-accessibility';

describe('DisplayAndAccessibility', () => {
  let component: DisplayAndAccessibility;
  let fixture: ComponentFixture<DisplayAndAccessibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayAndAccessibility],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayAndAccessibility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
