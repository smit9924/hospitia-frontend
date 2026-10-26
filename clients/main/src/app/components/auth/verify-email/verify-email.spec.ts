import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { VerifyEmail } from './verify-email';
import { Auth } from '../../../services/auth';
import { Profile } from '../../../services/profile';
import { Snackbar } from '../../../services/snackbar';
import { User } from '../../../services/user/user';
import { LoginApiResponseDto } from '../../../types/interfaces/auth';
import { LoginApiResponse } from '../../../types/models/auth/login-api-response';

describe('VerifyEmail', () => {
  let component: VerifyEmail;
  let fixture: ComponentFixture<VerifyEmail>;

  const tokenResponse: LoginApiResponseDto = {
    accessToken: 'new-access',
    accessTokenExpiry: '2026-10-25T10:00:00Z',
    refreshToken: 'new-refresh',
    refreshTokenExpiry: '2026-10-26T10:00:00Z',
    tokenType: 'bearer',
  };

  const callOrder: string[] = [];
  const userService = {
    requestEmailVerificationOtp: vi.fn(() => of({ message: 'sent' })),
    verifyEmailOtp: vi.fn(() => of(tokenResponse)),
  };
  const authService = {
    refreshToken: 'current-refresh' as string | null,
    setLoginSession: vi.fn(() => callOrder.push('setLoginSession')),
  };
  const profileService = {
    loadProfile: vi.fn(async () => {
      callOrder.push('loadProfile');
    }),
    redirectToDefaultHome: vi.fn(async () => {
      callOrder.push('redirectToDefaultHome');
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    callOrder.length = 0;
    authService.refreshToken = 'current-refresh';

    await TestBed.configureTestingModule({
      imports: [VerifyEmail],
      providers: [
        { provide: User, useValue: userService },
        { provide: Auth, useValue: authService },
        { provide: Profile, useValue: profileService },
        { provide: Snackbar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends the stored refresh token with the OTP', () => {
    component.verifyEmailForm.setValue({ otp: '123456' });

    component.verifyOtp();

    expect(userService.verifyEmailOtp).toHaveBeenCalledWith('123456', 'current-refresh');
  });

  it('stores the returned tokens before loading the profile and redirecting', async () => {
    component.verifyEmailForm.setValue({ otp: '123456' });

    component.verifyOtp();
    await fixture.whenStable();

    expect(authService.setLoginSession).toHaveBeenCalledWith(new LoginApiResponse(tokenResponse));
    expect(callOrder).toEqual(['setLoginSession', 'loadProfile', 'redirectToDefaultHome']);
  });
});
