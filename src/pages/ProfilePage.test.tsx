import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { loginAsUser, navigateTo, renderApp } from '../test/testUtils';

vi.mock('../lib/supabase', async () => {
  const { supabaseMock } = await import('../test/supabaseMock');
  return { supabase: supabaseMock };
});

describe('profile page', () => {
  it('shows the signed-in player and an empty match history', async () => {
    renderApp();
    await loginAsUser();
    navigateTo('Profile');

    expect(
      screen.getByRole('heading', { name: 'Your player card' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'TestPlayer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('@TestPlayer')).toBeInTheDocument();
    expect(screen.getByText('testplayer@example.com')).toBeInTheDocument();
    expect(screen.getByText('Best match score')).toBeInTheDocument();
    expect(screen.getByText('No matches recorded')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
