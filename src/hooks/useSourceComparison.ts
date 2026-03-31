import { useQuery } from '@tanstack/react-query';
import { compareSourceSystems } from '../api/events';
import { useGlobalFilters } from './useGlobalFilters';

export function useSourceComparison(params: {
  sourceA: string;
  sourceB: string;
  windowSeconds?: number;
  sampleLimit?: number;
}) {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['events', 'source-comparison', { ...params, ...filters }],
    queryFn: () => compareSourceSystems({ ...params, ...filters }),
    enabled: !!params.sourceA && !!params.sourceB,
  });
}
