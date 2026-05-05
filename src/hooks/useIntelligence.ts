import { useQuery } from '@tanstack/react-query';
import { getIntelligenceSummary } from '../api/intelligence';

export function useIntelligenceSummary() {
  return useQuery({
    queryKey: ['intelligence', 'summary'],
    queryFn: () => getIntelligenceSummary(),
  });
}
