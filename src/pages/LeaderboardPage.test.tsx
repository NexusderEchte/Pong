import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { testUser } from '../test/fixtures';
import LeaderboardPage from './LeaderboardPage';

function renderLeaderboard() {
  return render(
    <AuthProvider initialUser={testUser}>
      <LeaderboardPage />
    </AuthProvider>,
  );
}

describe('LeaderboardPage', () => {
  it('highlights the top three and the current player', () => {
    renderLeaderboard();

    expect(
      screen.getByRole('heading', { name: 'Leaderboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kaito' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mira' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Diego' })).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('filters the standings by player name', () => {
    renderLeaderboard();

    const table = screen.getByRole('table');

    fireEvent.change(screen.getByLabelText('Search players'), {
      target: { value: 'Kai' },
    });

    expect(within(table).getByText('Kaito')).toBeInTheDocument();
    expect(within(table).queryByText('Mira')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search players'), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('No players found')).toBeInTheDocument();
  });
});
