import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyAndSecurity } from './privacy-and-security';

describe('PrivacyAndSecurity', () => {
  let component: PrivacyAndSecurity;
  let fixture: ComponentFixture<PrivacyAndSecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyAndSecurity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyAndSecurity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
