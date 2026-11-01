import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders dashboard with stats cards', () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>,
    );
    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('Spiele gesamt')).toBeInTheDocument();
  });
});
