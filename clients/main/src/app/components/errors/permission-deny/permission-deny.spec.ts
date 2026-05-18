import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionDeny } from './permission-deny';

describe('PermissionDeny', () => {
  let component: PermissionDeny;
  let fixture: ComponentFixture<PermissionDeny>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionDeny],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionDeny);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
