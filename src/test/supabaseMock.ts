import { vi } from 'vitest';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_USERNAME = 'TestPlayer';
export const TEST_EMAIL = 'testplayer@example.com';
export const TEST_PASSWORD = 'password123';

export interface ProfileFixture {
  id: string;
  username: string;
}

export const TEST_PROFILE: ProfileFixture = {
  id: TEST_USER_ID,
  username: TEST_USERNAME,
};

export interface QueryResult {
  data: unknown;
  error: unknown;
}

export interface QueryMock {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: (
    onFulfilled?: ((value: QueryResult) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
}

export function createUsersQuery(
  options: {
    select?: QueryResult;
    insert?: QueryResult;
    list?: QueryResult | Promise<QueryResult>;
  } = {},
): QueryMock {
  const query = {} as QueryMock;
  let pending: QueryResult | Promise<QueryResult> = options.list ?? {
    data: [],
    error: null,
  };

  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.maybeSingle = vi.fn(() =>
    Promise.resolve(options.select ?? { data: null, error: null }),
  );
  query.insert = vi.fn(() => {
    pending = options.insert ?? { data: null, error: null };
    return query;
  });
  query.single = vi.fn(() =>
    Promise.resolve(options.insert ?? { data: null, error: null }),
  );
  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(pending).then(onFulfilled, onRejected);

  return query;
}

export function makeSession(profile: ProfileFixture = TEST_PROFILE): Session {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: 0,
    token_type: 'bearer',
    user: {
      id: profile.id,
      email: TEST_EMAIL,
      created_at: '2026-01-01T00:00:00.000Z',
      app_metadata: {},
      user_metadata: { username: profile.username },
      aud: 'authenticated',
    },
  } as unknown as Session;
}

type AuthChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

let authCallbacks: AuthChangeCallback[] = [];

export function emitAuthStateChange(
  event: AuthChangeEvent,
  session: Session | null,
): void {
  authCallbacks.forEach((callback) => callback(event, session));
}

export const supabaseMock = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
};

export function resetSupabaseMock(): void {
  vi.clearAllMocks();
  authCallbacks = [];

  supabaseMock.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  supabaseMock.auth.onAuthStateChange.mockImplementation(
    (callback: AuthChangeCallback) => {
      authCallbacks.push(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    },
  );
  supabaseMock.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
  supabaseMock.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  });
  supabaseMock.auth.signOut.mockResolvedValue({ error: null });
  supabaseMock.from.mockReturnValue(createUsersQuery());
}
