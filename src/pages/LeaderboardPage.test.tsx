import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import LeaderboardPage from './LeaderboardPage';

describe('LeaderboardPage', () => {
  it('renders leaderboard table with top 3 highlighted', () => {
    render(
      <AuthProvider>
        <LeaderboardPage />
      </AuthProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /globale rangliste/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText('Ace')).toBeInTheDocument();
    expect(screen.getByText('Zephyr')).toBeInTheDocument();
    // Top 3 rows highlighted
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(3);
  });
});
