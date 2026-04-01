import { useQuery } from '@tanstack/react-query';
import { getFacilityRanking } from '../api/facilities';
import { useGlobalFilters } from './useGlobalFilters';
import type { RankBy, SortOrder } from '../api/types';

export function useFacilityRanking(params?: {
  protocolDefinitionId?: string;
  rankBy?: RankBy;
  order?: SortOrder;
  limit?: number;
  cursor?: string;
}) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['facilities', 'ranking', { ...params, ...filters }],
    queryFn: () => getFacilityRanking({ ...params, ...filters }),
  });
}
