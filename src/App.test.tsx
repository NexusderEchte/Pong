import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { loginAsDemo, renderApp } from './test/testUtils';

describe('authentication', () => {
  it('renders the login screen with the brand heading', () => {
    renderApp();

    expect(
      screen.getByRole('heading', { name: 'Ping Pong' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' }),
    ).toBeInTheDocument();
  });

  it('validates an empty login form', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      screen.getByText('Please enter your email address.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
  });

  it('signs in with the demo account and shows dashboard statistics', () => {
    renderApp();
    loginAsDemo();

    expect(
      screen.getByRole('heading', { name: /welcome back, novastrike/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Matches played')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Personal bests')).toBeInTheDocument();
    expect(screen.getByText('Next milestone')).toBeInTheDocument();
  });

  it('shows an error for invalid credentials', () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'demo@pingpong.app' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'not-the-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /invalid email or password/i,
    );
  });

  it('validates registration fields', () => {
    renderApp();

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

  it('registers a new player and opens their dashboard', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'TestPlayer' },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'supersecret' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'supersecret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      screen.getByRole('heading', { name: /welcome back, testplayer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('No matches yet')).toBeInTheDocument();
  });
});
