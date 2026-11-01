import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the authentication screen for guests', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /ping pong/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it('signs in with the mock credentials and opens the dashboard', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'nova@pingpong.dev' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pong1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      screen.getByRole('heading', { name: /welcome back, nova/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Recent matches')).toBeInTheDocument();
  });

  it('creates a mock account and opens the dashboard', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

    expect(
      await screen.findByRole('heading', { name: /join the arena/i }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'ace' },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'ace@pingpong.dev' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pong1234' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'pong1234' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      screen.getByRole('heading', { name: /welcome back, ace/i }),
    ).toBeInTheDocument();
  });
});
