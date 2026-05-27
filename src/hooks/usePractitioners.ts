import { useQuery } from '@tanstack/react-query';
import { getPractitionerRanking } from '../api/practitioners';
import type { PractitionerRankBy, SortOrder } from '../api/types';

export function usePractitionerRanking(params?: {
  rankBy?: PractitionerRankBy;
  order?: SortOrder;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['practitioners', 'ranking', params],
    queryFn: () => getPractitionerRanking(params),
  });
}
