import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { loginAsUser, navigateTo, renderApp } from '../test/testUtils';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

describe('game page', () => {
  it('starts, pauses, resumes and restarts a match', async () => {
    renderApp();
    await loginAsUser();
    navigateTo('Play');

    expect(
      screen.getByRole('heading', { name: 'Play a match' }),
    ).toBeInTheDocument();
    expect(screen.getByText('AI opponent')).toBeInTheDocument();
    expect(screen.getByLabelText('TestPlayer score')).toHaveTextContent('0');
    expect(screen.getByLabelText('SmashKing score')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Start match' }));

    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.getAllByText('Paused').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Resume match' }));

    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('TestPlayer score')).toHaveTextContent('0');
    expect(screen.getByLabelText('SmashKing score')).toHaveTextContent('0');
    expect(
      screen.getByRole('button', { name: 'Start match' }),
    ).toBeInTheDocument();
  });

  it('shows the keyboard controls and winning score', async () => {
    renderApp();
    await loginAsUser();
    navigateTo('Play');

    expect(screen.getAllByText('First to 5').length).toBeGreaterThan(0);
    expect(screen.getByText('W / ↑')).toBeInTheDocument();
    expect(screen.getByText('S / ↓')).toBeInTheDocument();
  });
});
