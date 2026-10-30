import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSetupLoader } from './account-setup-loader';

describe('AccountSetupLoader', () => {
  let component: AccountSetupLoader;
  let fixture: ComponentFixture<AccountSetupLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSetupLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSetupLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('announces that the account is being set up', () => {
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');

    expect(status.textContent).toContain('Setting up your account');
  });
});
