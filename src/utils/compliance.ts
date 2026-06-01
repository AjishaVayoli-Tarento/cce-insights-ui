import type { StepInstance } from '../api/types';

export function parseCanonicalUrl(canonical: string): { url: string; version: string; name: string } {
  const parts = canonical.split('|');
  const url = parts[0];
  const version = parts[1] || '';
  const segments = url.split('/');
  const name = segments[segments.length - 1];
  return { url, version, name };
}

export function classifyComplianceCategory(steps: StepInstance[]): 'on_track' | 'non_compliant' {
  const hasMissed = steps.some((s) => s.state === 'MISSED');
  if (hasMissed) return 'non_compliant';
  const hasOverdue = steps.some((s) => s.state === 'OVERDUE');
  if (hasOverdue) return 'non_compliant';
  return 'on_track';
}
