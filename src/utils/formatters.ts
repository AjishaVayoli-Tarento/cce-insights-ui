export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatPercentage(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
