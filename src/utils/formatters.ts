export function formatNumber(n: number | null | undefined): string {
  return n != null ? n.toLocaleString() : '—';
}

export function formatPercentage(n: number | null | undefined, decimals = 1): string {
  return n != null ? `${n.toFixed(decimals)}%` : '—';
}

export function formatRate(rate: number | null | undefined): string {
  return rate != null ? `${(rate * 100).toFixed(1)}%` : '—';
}

/**
 * Returns the practitioner display name when available, otherwise derives a
 * readable id from the reference (e.g. "Practitioner/HLC-PRAC-001" → "HLC-PRAC-001").
 */
export function formatPractitionerName(ref: string, display?: string | null): string {
  if (display) return display;
  const parts = ref.split('/');
  return parts.length > 1 ? parts[1] : ref;
}
