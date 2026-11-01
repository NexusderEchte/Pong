import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { demoUser } from '../data/mockData';
import type { User } from '../types';
import {
  AuthContext,
  type AuthResult,
  type RegisterInput,
} from './AuthContext';

const SESSION_KEY = 'pingpong.session';
const DEMO_PASSWORD = 'pong1234';

interface MockAccount {
  user: User;
  password: string;
}

function readStoredSession(): User | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistSession(user: User | null) {
  try {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // The prototype keeps working even if storage is unavailable.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredSession);
  const accounts = useRef<Map<string, MockAccount>>(
    new Map([
      [
        demoUser.email,
        {
          user: demoUser,
          password: DEMO_PASSWORD,
        },
      ],
    ]),
  );

  const login = useCallback((email: string, password: string): AuthResult => {
    const account = accounts.current.get(email.trim().toLowerCase());

    if (!account || account.password !== password) {
      return {
        ok: false,
        error: 'Invalid email or password. Try the demo account below.',
      };
    }

    setUser(account.user);
    persistSession(account.user);
    return { ok: true };
  }, []);

  const register = useCallback((input: RegisterInput): AuthResult => {
    const email = input.email.trim().toLowerCase();

    if (accounts.current.has(email)) {
      return {
        ok: false,
        error: 'An account with this email already exists.',
      };
    }

    const username = input.username.trim();
    const newUser: User = {
      id: `u-${Date.now()}`,
      username,
      email,
      fullName: username,
      bio: 'New to the table and ready for the first rally.',
      location: 'Not set yet',
      joinedAt: new Date().toISOString(),
      accent: '#4da3ff',
      stats: {
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        points: 0,
        rank: 0,
        bestStreak: 0,
        bestScore: '—',
        tournamentsWon: 0,
        averagePoints: 0,
      },
    };

    accounts.current.set(email, { user: newUser, password: input.password });
    setUser(newUser);
    persistSession(newUser);

    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persistSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
