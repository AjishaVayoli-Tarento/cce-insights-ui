import { useCallback } from 'react';
import { useFacilityLookup } from './useLookups';

/**
 * Returns a resolver that maps a facility id to its display name using the
 * `/lookups/facilities` data. Falls back to the raw id when no name is available.
 */
export function useFacilityName() {
  const { data } = useFacilityLookup();

  return useCallback(
    (facilityId: string | null | undefined): string => {
      if (!facilityId) return '—';
      const match = data?.find((f) => f.id === facilityId);
      return match?.name ?? facilityId;
    },
    [data],
  );
}
