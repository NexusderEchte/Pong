import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { loginAsDemo, navigateTo, renderApp } from '../test/testUtils';

describe('game page', () => {
  it('starts, pauses, scores and resets a match', () => {
    renderApp();
    loginAsDemo();
    navigateTo('Play');

    expect(
      screen.getByRole('heading', { name: 'Play a match' }),
    ).toBeInTheDocument();

    const homeScore = screen.getByLabelText('NovaStrike score');
    expect(homeScore).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Start match' }));

    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getAllByText('Paused').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Resume match' }));
    fireEvent.click(screen.getByRole('button', { name: '+1 NovaStrike' }));

    expect(screen.getByLabelText('NovaStrike score')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('NovaStrike score')).toHaveTextContent('0');
    expect(
      screen.getByRole('button', { name: 'Start match' }),
    ).toBeInTheDocument();
  });

  it('declares a winner when a player reaches eleven points', () => {
    renderApp();
    loginAsDemo();
    navigateTo('Play');

    fireEvent.click(screen.getByRole('button', { name: 'Start match' }));

    const pointButton = screen.getByRole('button', { name: '+1 NovaStrike' });
    for (let point = 0; point < 11; point += 1) {
      fireEvent.click(pointButton);
    }

    expect(screen.getByText('NovaStrike wins')).toBeInTheDocument();
    expect(screen.getAllByText('Match over').length).toBeGreaterThan(0);
  });
});
