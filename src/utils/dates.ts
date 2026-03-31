import { format, formatDistanceToNow, differenceInDays, subDays } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy HH:mm');
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

export function getDefaultDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = subDays(end, days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}
