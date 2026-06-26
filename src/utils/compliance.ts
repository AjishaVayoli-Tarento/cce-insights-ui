import type { ComplianceCategory } from '../api/types';

export function parseCanonicalUrl(canonical: string): { url: string; version: string; name: string } {
  const parts = canonical.split('|');
  const url = parts[0];
  const version = parts[1] || '';
  const segments = url.split('/');
  const name = segments[segments.length - 1];
  return { url, version, name };
}

/**
 * Matches dashboard and insights-service: compliant only when the patient has
 * no deviation records (optionally scoped to the selected date range).
 */
export function classifyComplianceCategory(deviationCount: number): ComplianceCategory {
  return deviationCount > 0 ? 'non_compliant' : 'on_track';
}

export function complianceCategoryLabel(category: ComplianceCategory | string): string {
  return category === 'on_track' ? 'Compliant' : 'Non-Compliant';
}

export const COMPLIANCE_CATEGORY_HELP =
  'Category is based on deviation records (same as the dashboard): Compliant = no deviations in the selected period; Non-Compliant = one or more deviations. The Rate column shows step completion percentage and is independent of category.';

export const COMPLIANCE_RATE_HELP =
  'Step completion rate — completed or skipped steps divided by total steps. This does not determine Compliant / Non-Compliant status.';
