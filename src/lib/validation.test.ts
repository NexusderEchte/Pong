import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validateLogin,
  validatePassword,
  validateRegister,
} from './validation';

describe('validation', () => {
  it('rejects malformed email addresses', () => {
    expect(validateEmail('')).toBe('Enter your email address.');
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address.');
    expect(validateEmail('nova@pingpong.dev')).toBeUndefined();
  });

  it('requires passwords with at least six characters', () => {
    expect(validatePassword('')).toBe('Enter your password.');
    expect(validatePassword('123')).toBe('Use at least 6 characters.');
    expect(validatePassword('pong1234')).toBeUndefined();
  });

  it('validates login values', () => {
    expect(validateLogin({ email: 'bad', password: '123' })).toEqual({
      email: 'Enter a valid email address.',
      password: 'Use at least 6 characters.',
    });

    expect(
      validateLogin({ email: 'nova@pingpong.dev', password: 'pong1234' }),
    ).toEqual({});
  });

  it('validates registration values', () => {
    const errors = validateRegister({
      username: 'no',
      email: 'bad',
      password: '123',
      confirmPassword: '456',
      acceptTerms: false,
    });

    expect(errors).toEqual({
      username: 'Use at least 3 characters.',
      email: 'Enter a valid email address.',
      password: 'Use at least 6 characters.',
      confirmPassword: 'Passwords do not match.',
      acceptTerms: 'Accept the fair play rules to continue.',
    });

    expect(
      validateRegister({
        username: 'rally_ace',
        email: 'ace@pingpong.dev',
        password: 'pong1234',
        confirmPassword: 'pong1234',
        acceptTerms: true,
      }),
    ).toEqual({});
  });
});
