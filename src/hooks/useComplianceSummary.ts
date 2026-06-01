import { useQuery } from '@tanstack/react-query';
import { getAllProtocolsComplianceSummary, getProtocolComplianceSummary, getFacilityComplianceSummary, getProtocolPatients } from '../api/compliance';
import { useGlobalFilters } from './useGlobalFilters';

export function useProtocolComplianceSummary(protocolDefinitionId: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['compliance', 'summary', protocolDefinitionId || 'all', filters],
    queryFn: () => protocolDefinitionId
      ? getProtocolComplianceSummary(protocolDefinitionId, filters)
      : getAllProtocolsComplianceSummary(filters),
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
