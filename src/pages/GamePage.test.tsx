import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { testUser } from '../test/fixtures';
import GamePage from './GamePage';

function renderGamePage() {
  return render(
    <AuthProvider initialUser={testUser}>
      <GamePage />
    </AuthProvider>,
  );
}

describe('GamePage', () => {
  it('starts and pauses the visual rally', () => {
    renderGamePage();

    expect(screen.getByRole('status')).toHaveTextContent('Match paused');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByRole('status')).toHaveTextContent('Rally in progress');
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getByRole('status')).toHaveTextContent('Match paused');
  });

  it('updates the scoreboard and resets the match', () => {
    renderGamePage();

    expect(screen.getByLabelText('Kaito score')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: '+1 Kaito' }));
    fireEvent.click(screen.getByRole('button', { name: '+1 Nova' }));

    expect(screen.getByLabelText('Kaito score')).toHaveTextContent('1');
    expect(screen.getByLabelText('Nova score')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('Kaito score')).toHaveTextContent('0');
    expect(screen.getByLabelText('Nova score')).toHaveTextContent('0');
  });
});
