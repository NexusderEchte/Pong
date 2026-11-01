import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { loginAsDemo, navigateTo, renderApp } from '../test/testUtils';

describe('profile page', () => {
  it('shows profile information, statistics and mock match history', () => {
    renderApp();
    loginAsDemo();
    navigateTo('Profile');

    expect(
      screen.getByRole('heading', { name: 'Your player card' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nova Lindqvist' }),
    ).toBeInTheDocument();
    expect(screen.getByText('@NovaStrike')).toBeInTheDocument();
    expect(screen.getByText('Best match score')).toBeInTheDocument();

    const historyTable = screen.getByRole('table');
    expect(within(historyTable).getAllByRole('row')).toHaveLength(9);
    expect(within(historyTable).getByText('SpinMaster')).toBeInTheDocument();
    expect(within(historyTable).getByText('RallyQueen')).toBeInTheDocument();
  });
});
