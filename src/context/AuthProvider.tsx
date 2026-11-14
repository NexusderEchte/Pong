import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import {
  AuthContext,
  type AuthResult,
  type RegisterInput,
} from './AuthContext';

interface ProfileRow {
  id: string;
  username: string;
}

function emptyStats(): User['stats'] {
  return {
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
  };
}

function toAppUser(profile: ProfileRow, authUser: SupabaseUser): User {
  return {
    id: profile.id,
    username: profile.username,
    email: authUser.email ?? '',
    fullName: profile.username,
    bio: 'New to the table and ready for the first rally.',
    location: 'Not set yet',
    joinedAt: authUser.created_at ?? new Date().toISOString(),
    accent: '#4da3ff',
    stats: emptyStats(),
  };
}

function metadataUsername(authUser: SupabaseUser): string {
  const value = authUser.user_metadata?.username;
  return typeof value === 'string' ? value.trim() : '';
}

function isDuplicate(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProfileRow | null) ?? null;
}

async function insertProfile(
  userId: string,
  username: string,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('users')
    .insert({ id: userId, username })
    .select('id, username')
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}

async function loadOrCreateProfile(
  session: Session,
): Promise<ProfileRow | null> {
  const existing = await fetchProfile(session.user.id);

  if (existing) {
    return existing;
  }

  const username = metadataUsername(session.user);

  if (!username) {
    return null;
  }

  try {
    return await insertProfile(session.user.id, username);
  } catch (error) {
    if (isDuplicate(error)) {
      const raced = await fetchProfile(session.user.id);

      if (raced) {
        return raced;
      }
    }

    throw error;
  }
}

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (
    normalized.includes('already registered') ||
    normalized.includes('already been registered') ||
    normalized.includes('user already exists')
  ) {
    return 'An account with this email already exists.';
  }

  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many requests')
  ) {
    return 'Too many attempts. Please try again later.';
  }

  if (normalized.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }

  return 'Authentication failed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (session: Session | null) => {
      if (!session) {
        if (!cancelled) {
          setUser(null);
        }
        return;
      }

      try {
        const profile = await loadOrCreateProfile(session);

        if (!cancelled) {
          setUser(profile ? toAppUser(profile, session.user) : null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      }
    };

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await applySession(data.session);
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { ok: false, error: mapAuthError(error.message) };
      }

      if (!data.session) {
        return { ok: false, error: 'Sign in failed. Please try again.' };
      }

      try {
        const profile = await loadOrCreateProfile(data.session);

        if (!profile) {
          return {
            ok: false,
            error: 'Your player profile could not be loaded.',
          };
        }

        setUser(toAppUser(profile, data.session.user));
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: 'Your player profile could not be loaded.',
        };
      }
    },
    [],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthResult> => {
      const username = input.username.trim();
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { username },
        },
      });

      if (error) {
        return { ok: false, error: mapAuthError(error.message) };
      }

      if (!data.user) {
        return { ok: false, error: 'Registration failed. Please try again.' };
      }

      if (!data.session) {
        return {
          ok: true,
          message:
            'Registration successful. Check your email to confirm your account, then sign in.',
        };
      }

      try {
        const profile = await insertProfile(data.user.id, username);
        setUser(toAppUser(profile, data.user));
        return { ok: true };
      } catch (profileError) {
        if (isDuplicate(profileError)) {
          const existing = await fetchProfile(data.user.id);

          if (existing?.username === username) {
            setUser(toAppUser(existing, data.user));
            return { ok: true };
          }

          await supabase.auth.signOut().catch(() => undefined);
          setUser(null);
          return {
            ok: false,
            error: 'That username is already taken.',
          };
        }

        await supabase.auth.signOut().catch(() => undefined);
        setUser(null);
        return {
          ok: false,
          error:
            'Your account was created, but the player profile could not be saved. Please try again.',
        };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut().catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
