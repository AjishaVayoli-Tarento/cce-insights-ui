import { useQuery } from '@tanstack/react-query';
import { getIntelligenceSummary } from '../api/intelligence';
import { useGlobalFilters } from './useGlobalFilters';

export function useIntelligenceSummary(protocolDefinitionId?: string) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['intelligence', 'summary', { ...filters, protocolDefinitionId }],
    queryFn: () => getIntelligenceSummary({ ...filters, protocolDefinitionId }),
  });
}
