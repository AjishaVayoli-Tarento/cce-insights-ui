export function formatNumber(n: number | null | undefined): string {
  return n != null ? n.toLocaleString() : '—';
}

export function formatPercentage(n: number | null | undefined, decimals = 1): string {
  return n != null ? `${n.toFixed(decimals)}%` : '—';
}

export function formatRate(rate: number | null | undefined): string {
  return rate != null ? `${(rate * 100).toFixed(1)}%` : '—';
}
