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

/**
 * Returns names that map to two or more **distinct** facility ids. Rows are first
 * deduplicated by `facilityId` so a facility appearing in both Top and Bottom 5 lists
 * is not treated as a name collision with itself.
 */
export function findDuplicateFacilityNames(
  rows: ReadonlyArray<Pick<FacilityRanking, 'facilityId' | 'facilityName'>>,
): Set<string> {
  const idsByName = new Map<string, Set<string>>();
  for (const row of rows) {
    const name = getFacilityLabel(row);
    const ids = idsByName.get(name) ?? new Set<string>();
    ids.add(row.facilityId);
    idsByName.set(name, ids);
  }
  return new Set(
    [...idsByName.entries()]
      .filter(([, ids]) => ids.size > 1)
      .map(([name]) => name),
  );
}
