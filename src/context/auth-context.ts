import { createContext, useContext } from 'react';
import type { AuthUser } from '../types';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => AuthResult;
  register: (username: string, email: string, password: string) => AuthResult;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
