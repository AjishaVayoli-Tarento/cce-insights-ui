/** Fallback name for the hardcoded demo facility only. */
const FACILITY_NAME_MAP: Record<string, string> = {
  'ruhuha-hc': 'Ruhuha Health Centre',
};

export function getFacilityName(facilityId: string): string {
  return FACILITY_NAME_MAP[facilityId] ?? facilityId;
}
