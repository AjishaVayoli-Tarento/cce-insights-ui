import type { FacilityRanking } from '../api/types';

/** Prefer reference/API name, fall back to facility id. */
export function getFacilityLabel(f: Pick<FacilityRanking, 'facilityId' | 'facilityName'>): string {
  return f.facilityName?.trim() || f.facilityId;
}

/**
 * When multiple facilities share the same display name, append the facility id
 * so each row is distinguishable in tables.
 */
export function formatFacilityDisplayName(
  f: Pick<FacilityRanking, 'facilityId' | 'facilityName'>,
  duplicateNames: ReadonlySet<string>,
): string {
  const name = getFacilityLabel(f);
  return duplicateNames.has(name) ? `${name} (${f.facilityId})` : name;
}

export function findDuplicateFacilityNames(
  rows: ReadonlyArray<Pick<FacilityRanking, 'facilityId' | 'facilityName'>>,
): Set<string> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = getFacilityLabel(row);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([name]) => name));
}
