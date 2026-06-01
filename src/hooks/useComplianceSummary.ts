import { useQuery } from '@tanstack/react-query';
import { getAllProtocolsComplianceSummary, getProtocolComplianceSummary, getFacilityComplianceSummary, getProtocolPatients } from '../api/compliance';
import { useGlobalFilters } from './useGlobalFilters';

export function useProtocolComplianceSummary(protocolDefinitionId: string, facilityId?: string) {
  const filters = useGlobalFilters();
  const effectiveFilters = { ...filters, ...(facilityId ? { facilityId } : {}) };
  return useQuery({
    queryKey: ['compliance', 'summary', protocolDefinitionId || 'all', effectiveFilters],
    queryFn: () => protocolDefinitionId
      ? getProtocolComplianceSummary(protocolDefinitionId, effectiveFilters)
      : getAllProtocolsComplianceSummary(effectiveFilters),
  });
}

export function useFacilityComplianceSummary(facilityId: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['compliance', 'facility', facilityId, filters],
    queryFn: () => getFacilityComplianceSummary(facilityId, filters),
    enabled: !!facilityId,
  });
}

export function useProtocolPatients(
  protocolDefinitionId: string,
  params?: { status?: string; facilityId?: string; limit?: number; cursor?: string; patientId?: string },
) {
  return useQuery({
    queryKey: ['compliance', 'patients', protocolDefinitionId, params],
    queryFn: () => getProtocolPatients(protocolDefinitionId, params),
    enabled: !!protocolDefinitionId,
  });
}
