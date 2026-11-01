import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
      {user ? <span data-testid="username">{user.username}</span> : null}
      <button data-testid="login" onClick={() => login('a@b.c', 'pw')}>
        Login
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts unauthenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId('authenticated').textContent).toBe('no');
  });

  it('logs in and persists user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
      vi.runAllTimers();
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('yes');
    expect(screen.getByTestId('username').textContent).toBe('a');
    expect(window.localStorage.getItem('pp_auth_user')).not.toBeNull();
  });

  it('logs out and clears storage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByTestId('logout'));
    expect(screen.getByTestId('authenticated').textContent).toBe('no');
    expect(window.localStorage.getItem('pp_auth_user')).toBeNull();
  });
});
