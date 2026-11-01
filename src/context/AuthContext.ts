import { createContext, useContext } from 'react';
import type { User } from '../types';

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => AuthResult;
  register: (input: RegisterInput) => AuthResult;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
