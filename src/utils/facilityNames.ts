/** Maps facility IDs to human-readable names for demo display. */
const FACILITY_NAME_MAP: Record<string, string> = {
  '0022': 'Nyamata District Hospital',
  '48f207f6-2fd6-43e4-837d-41858e394483': 'Kacyiru Health Centre',
  '0030': 'Kibagabaga District Hospital',
  '0035': 'Masaka District Hospital',
  '0552': 'Kigali Teaching Hospital (CHUK)',
  '001': 'Muhima District Hospital',
  'ruhuha-hc': 'Ruhuha Health Centre',
};

export function getFacilityName(facilityId: string): string {
  return FACILITY_NAME_MAP[facilityId] ?? facilityId;
}
