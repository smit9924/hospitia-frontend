import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSnackbar } from './generic-snackbar';

describe('GenericSnackbar', () => {
  let component: GenericSnackbar;
  let fixture: ComponentFixture<GenericSnackbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericSnackbar],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericSnackbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
