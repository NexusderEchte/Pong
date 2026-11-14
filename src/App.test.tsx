import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  loginAsUser,
  mockLoginFailure,
  mockRegistrationSuccess,
  mockRestoredSession,
  renderApp,
} from './test/testUtils';
import {
  supabaseMock,
  TEST_EMAIL,
  TEST_PASSWORD,
  TEST_PROFILE,
} from './test/supabaseMock';

vi.mock('./lib/supabase', async () => {
  const { supabaseMock } = await import('./test/supabaseMock');
  return { supabase: supabaseMock };
});

describe('authentication', () => {
  it('renders the login screen with the brand heading', async () => {
    renderApp();

    expect(
      await screen.findByRole('heading', { name: 'Ping Pong' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeInTheDocument();
  });

  it('validates an empty login form', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      screen.getByText('Please enter your email address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
  });

  it('signs in with Supabase and shows the dashboard', async () => {
    renderApp();
    await loginAsUser();

    expect(
      screen.getByRole('heading', { name: /welcome back, testplayer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Matches played')).toBeInTheDocument();
    expect(screen.getByText('No matches yet')).toBeInTheDocument();
    expect(window.localStorage.getItem('pingpong.session')).toBeNull();
  });

  it('shows an error for invalid credentials', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    mockLoginFailure();
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: TEST_EMAIL },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid email or password/i,
    );
  });

  it('validates registration fields', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Please choose a username.')).toBeInTheDocument();
    expect(
      screen.getByText('Please enter your email address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Please create a password.')).toBeInTheDocument();
    expect(
      screen.getByText('Please confirm your password.'),
    ).toBeInTheDocument();
  });

  it('registers a new player and opens their dashboard', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    mockRegistrationSuccess();
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: TEST_PROFILE.username },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: TEST_EMAIL },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByRole('heading', {
        name: /welcome back, testplayer/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('No matches yet')).toBeInTheDocument();
    expect(supabaseMock.from).toHaveBeenCalledWith('users');
    expect(window.localStorage.getItem('pingpong.session')).toBeNull();
  });

  it('shows a confirmation message when email confirmation is required', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    mockRegistrationSuccess(TEST_PROFILE, { requiresConfirmation: true });
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: TEST_PROFILE.username },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: TEST_EMAIL },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      /check your email/i,
    );
    expect(
      screen.getByRole('heading', { name: 'Join the table' }),
    ).toBeInTheDocument();
  });

  it('shows an error when the username is already taken', async () => {
    renderApp();

    await screen.findByRole('heading', { name: 'Sign in to your account' });
    mockRegistrationSuccess(TEST_PROFILE, {
      profileResult: {
        data: null,
        error: { code: '23505', message: 'duplicate key value' },
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: TEST_PROFILE.username },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: TEST_EMAIL },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: TEST_PASSWORD },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /username is already taken/i,
    );
  });

  it('restores the session after a refresh and listens for auth changes', async () => {
    mockRestoredSession();
    renderApp();

    expect(
      await screen.findByRole('heading', {
        name: /welcome back, testplayer/i,
      }),
    ).toBeInTheDocument();
    expect(supabaseMock.auth.getSession).toHaveBeenCalled();
    expect(supabaseMock.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it('logs out and returns to the login screen', async () => {
    mockRestoredSession();
    renderApp();

    await screen.findByRole('heading', { name: /welcome back, testplayer/i });
    fireEvent.click(screen.getAllByRole('button', { name: 'Log out' })[0]);

    expect(
      await screen.findByRole('heading', { name: 'Sign in to your account' }),
    ).toBeInTheDocument();
    expect(supabaseMock.auth.signOut).toHaveBeenCalled();
  });
});
