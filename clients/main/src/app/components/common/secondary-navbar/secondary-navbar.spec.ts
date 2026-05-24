import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryNavbar } from './secondary-navbar';

describe('SecondaryNavbar', () => {
  let component: SecondaryNavbar;
  let fixture: ComponentFixture<SecondaryNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondaryNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondaryNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
