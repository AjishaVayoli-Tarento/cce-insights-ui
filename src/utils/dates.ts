import { formatDistanceToNow, differenceInDays, subDays } from 'date-fns';

// Filters send UTC day boundaries (T00:00:00Z..T23:59:59Z) and the API filters/stores
// timestamps in UTC, so dates are rendered in UTC to stay consistent with the selected
// range. Rendering in the browser's local timezone would shift a UTC timestamp onto an
// adjacent calendar day (e.g. 2026-06-22T20:00:00Z -> "Jun 23" in IST).
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

export function daysSince(dateStr: string): number {
  return differenceInDays(new Date(), new Date(dateStr));
}

export function toUtcString(date: Date): string {
  return date.toISOString();
}

/** Convert a YYYY-MM-DD date to start-of-day ISO OffsetDateTime */
export function toStartOfDayISO(date: string): string {
  return `${date}T00:00:00Z`;
}

/** Convert a YYYY-MM-DD date to end-of-day ISO OffsetDateTime */
export function toEndOfDayISO(date: string): string {
  return `${date}T23:59:59Z`;
}

export function getDefaultDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = subDays(end, days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}
