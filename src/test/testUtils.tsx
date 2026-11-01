import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';

export function renderApp() {
  return render(<App />);
}

export function loginAsDemo() {
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'demo@pingpong.app' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'pong1234' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

export function navigateTo(label: string) {
  const navigation = screen.getByRole('navigation', {
    name: 'Main navigation',
  });
  fireEvent.click(within(navigation).getByRole('button', { name: label }));
}
