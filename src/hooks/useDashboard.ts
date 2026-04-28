import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../api/dashboard';
import { useGlobalFilters } from './useGlobalFilters';

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL || 60000);

export function useDashboardOverview() {
  const filters = useGlobalFilters();
  return useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: () => getDashboardOverview(filters),
    refetchInterval: POLLING_INTERVAL,
  });
}
