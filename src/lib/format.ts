export function formatUsername(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Player';
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function usernameFromEmail(email: string): string {
  const localPart = email.trim().toLowerCase().split('@')[0] ?? 'player';
  const cleaned = localPart.replace(/[^a-z0-9._-]/g, '');

  return cleaned || 'player';
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}
