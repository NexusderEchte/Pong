import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import {
  createUsersQuery,
  makeSession,
  supabaseMock,
  TEST_EMAIL,
  TEST_PASSWORD,
  TEST_PROFILE,
  type ProfileFixture,
  type QueryResult,
} from './supabaseMock';

export function renderApp() {
  return render(<App />);
}

export function mockRestoredSession(profile: ProfileFixture = TEST_PROFILE) {
  const session = makeSession(profile);

  supabaseMock.auth.getSession.mockResolvedValue({
    data: { session },
    error: null,
  });
  supabaseMock.from.mockReturnValue(
    createUsersQuery({ select: { data: profile, error: null } }),
  );

  return session;
}

export function mockLoginSuccess(profile: ProfileFixture = TEST_PROFILE) {
  const session = makeSession(profile);

  supabaseMock.auth.signInWithPassword.mockResolvedValue({
    data: { user: session.user, session },
    error: null,
  });
  supabaseMock.from.mockReturnValue(
    createUsersQuery({ select: { data: profile, error: null } }),
  );

  return session;
}

export function mockLoginFailure(message = 'Invalid login credentials') {
  supabaseMock.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message },
  });
}

export interface RegistrationOptions {
  requiresConfirmation?: boolean;
  profileResult?: QueryResult;
}

export function mockRegistrationSuccess(
  profile: ProfileFixture = TEST_PROFILE,
  options: RegistrationOptions = {},
) {
  const session = makeSession(profile);

  supabaseMock.auth.signUp.mockResolvedValue({
    data: {
      user: session.user,
      session: options.requiresConfirmation ? null : session,
    },
    error: null,
  });
  supabaseMock.from.mockReturnValue(
    createUsersQuery({
      insert: options.profileResult ?? { data: profile, error: null },
      select: { data: null, error: null },
    }),
  );

  return session;
}

export function mockRegistrationFailure(message = 'User already registered') {
  supabaseMock.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: { message },
  });
}

export function mockLeaderboardResult(
  result: QueryResult | Promise<QueryResult>,
) {
  supabaseMock.from.mockReturnValue(createUsersQuery({ list: result }));
}

export async function loginAsUser(profile: ProfileFixture = TEST_PROFILE) {
  mockLoginSuccess(profile);

  await screen.findByLabelText('Email address');

  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: TEST_EMAIL },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: TEST_PASSWORD },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  await screen.findByRole('heading', {
    name: new RegExp(`welcome back, ${profile.username}`, 'i'),
  });
}

export function navigateTo(label: string) {
  const navigation = screen.getByRole('navigation', {
    name: 'Main navigation',
  });
  fireEvent.click(within(navigation).getByRole('button', { name: label }));
}
