import { useQuery } from '@tanstack/react-query';
import { getStepAnalytics, getCompletionFunnel, getOutcomeDistribution, getEnrollmentTrends, getActionOrder } from '../api/protocols';
import { useGlobalFilters } from './useGlobalFilters';

export function useStepAnalytics(protocolDefinitionId: string, facilityId?: string) {
  const filters = useGlobalFilters();
  const effectiveFilters = { ...filters, ...(facilityId ? { facilityId } : {}) };
  return useQuery({
    queryKey: ['protocols', 'step-analytics', protocolDefinitionId, effectiveFilters],
    queryFn: () => getStepAnalytics(protocolDefinitionId, effectiveFilters),
    enabled: !!protocolDefinitionId,
  });
}

export function useCompletionFunnel(protocolDefinitionId: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['protocols', 'completion-funnel', protocolDefinitionId, filters],
    queryFn: () => getCompletionFunnel(protocolDefinitionId, filters),
    enabled: !!protocolDefinitionId,
  });
}

export function useOutcomeDistribution(protocolDefinitionId: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['protocols', 'outcome-distribution', protocolDefinitionId, filters],
    queryFn: () => getOutcomeDistribution(protocolDefinitionId, filters),
    enabled: !!protocolDefinitionId,
  });
}

export function useEnrollmentTrends(protocolDefinitionId: string, interval = 'weekly') {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['protocols', 'enrollment-trends', protocolDefinitionId, { interval, ...filters }],
    queryFn: () => getEnrollmentTrends(protocolDefinitionId, { interval, ...filters }),
    enabled: !!protocolDefinitionId,
  });
}

export function useActionOrder(protocolDefinitionId: string) {
  return useQuery({
    queryKey: ['protocols', 'action-order', protocolDefinitionId],
    queryFn: () => getActionOrder(protocolDefinitionId),
    enabled: !!protocolDefinitionId,
  });
}
