import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { loginAsDemo, navigateTo, renderApp } from '../test/testUtils';

describe('leaderboard page', () => {
  it('shows the global table and highlights the top three players', () => {
    renderApp();
    loginAsDemo();
    navigateTo('Leaderboard');

    expect(
      screen.getByRole('heading', { name: 'Leaderboard' }),
    ).toBeInTheDocument();

    const table = screen.getByRole('table', {
      name: 'Global leaderboard',
    });
    const rows = within(table).getAllByRole('row');

    expect(rows).toHaveLength(11);

    ['SmashKing', 'SpinMaster', 'PaddlePro'].forEach((player) => {
      expect(
        within(table).getByRole('row', { name: new RegExp(player) }),
      ).toHaveClass('is-top-three');
    });
  });

  it('marks the signed-in player in the standings', () => {
    renderApp();
    loginAsDemo();
    navigateTo('Leaderboard');

    const table = screen.getByRole('table', {
      name: 'Global leaderboard',
    });
    const currentUserRow = within(table).getByRole('row', {
      name: /NovaStrike/,
    });

    expect(currentUserRow).toHaveClass('is-current-user');
    expect(within(currentUserRow).getByText('You')).toBeInTheDocument();
  });
});
