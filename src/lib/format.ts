const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const weekDayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
});

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(new Date(value));
}

export function formatMonthYear(value: string): string {
  return monthYearFormatter.format(new Date(value));
}

export function formatMatchDay(value: string): string {
  return weekDayFormatter.format(new Date(value));
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
