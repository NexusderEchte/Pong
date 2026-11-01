import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('shows validation errors for invalid credentials', () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter a valid email address.')).toBeVisible();
    expect(screen.getByText('Use at least 6 characters.')).toBeVisible();
  });
});
