import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayAndAppearance } from './display-and-appearance';

describe('DisplayAndAppearance', () => {
  let component: DisplayAndAppearance;
  let fixture: ComponentFixture<DisplayAndAppearance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayAndAppearance],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayAndAppearance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
