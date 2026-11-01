import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows form fields and submit button', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /anmelden/i }),
    ).toBeInTheDocument();
  });

  it('logs in and navigates to dashboard', async () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/passwort/i), {
      target: { value: 'password123' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /anmelden/i }));
      vi.runAllTimers();
    });
    expect(window.location.hash).toBe('#/dashboard');
  });
});
