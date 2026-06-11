import { PasswordStrengthCheck } from './password-strength-check';

describe('PasswordStrengthCheck', () => {
  it('should create an instance', () => {
    const directive = new PasswordStrengthCheck();
    expect(directive).toBeTruthy();
  });
});
