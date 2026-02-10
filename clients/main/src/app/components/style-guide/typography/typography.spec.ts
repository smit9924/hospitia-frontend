import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Typography } from './typography';

describe('Typography', () => {
  let component: Typography;
  let fixture: ComponentFixture<Typography>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Typography]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Typography);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
