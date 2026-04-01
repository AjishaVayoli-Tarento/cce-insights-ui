import { useQuery } from '@tanstack/react-query';
import {
  getDeviationTrends, getDeviationsByAction,
  getDeviationResolutionRate, getIntelligenceSummary,
} from '../api/deviations';
import { useGlobalFilters } from './useGlobalFilters';

export function useDeviationTrends(interval = 'weekly') {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['deviations', 'trends', { interval, ...filters }],
    queryFn: () => getDeviationTrends({ interval, ...filters }),
  });
}

export function useDeviationsByAction(protocolDefinitionId?: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['deviations', 'by-action', { protocolDefinitionId, ...filters }],
    queryFn: () => getDeviationsByAction({ protocolDefinitionId, ...filters }),
  });
}

export function useDeviationResolution() {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['deviations', 'resolution', filters],
    queryFn: () => getDeviationResolutionRate(filters),
  });
}

export function useIntelligenceSummary() {
  return useQuery({
    queryKey: ['intelligence', 'summary'],
    queryFn: getIntelligenceSummary,
    refetchInterval: Number(import.meta.env.VITE_POLLING_INTERVAL || 60000),
  });
}
