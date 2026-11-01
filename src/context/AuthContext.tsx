import { useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { formatUsername, usernameFromEmail } from '../lib/format';
import { AuthContext, type AuthResult } from './auth-context';

const STORAGE_KEY = 'pingpong.auth.user';

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthUser | null;
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (
      typeof parsed.username !== 'string' ||
      typeof parsed.email !== 'string'
    ) {
      return null;
    }

    return {
      username: parsed.username,
      email: parsed.email,
      displayName: parsed.displayName ?? formatUsername(parsed.username),
    };
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    return;
  }
}

function clearStoredUser(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    initialUser === undefined ? readStoredUser() : initialUser,
  );

  const login = (email: string, password: string): AuthResult => {
    if (!email.trim() || !password) {
      return { ok: false, error: 'Enter your email and password.' };
    }

    if (password.length < 6) {
      return {
        ok: false,
        error: 'Your password must have at least 6 characters.',
      };
    }

    const username = usernameFromEmail(email);

    const nextUser: AuthUser = {
      username,
      email: email.trim().toLowerCase(),
      displayName: formatUsername(username),
    };

    setUser(nextUser);
    persistUser(nextUser);

    return { ok: true };
  };

  const register = (
    username: string,
    email: string,
    password: string,
  ): AuthResult => {
    if (!username.trim() || !email.trim() || password.length < 6) {
      return { ok: false, error: 'Check your details and try again.' };
    }

    const normalizedUsername = username.trim().toLowerCase();

    const nextUser: AuthUser = {
      username: normalizedUsername,
      email: email.trim().toLowerCase(),
      displayName: formatUsername(normalizedUsername),
    };

    setUser(nextUser);
    persistUser(nextUser);

    return { ok: true };
  };

  const logout = (): void => {
    setUser(null);
    clearStoredUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
