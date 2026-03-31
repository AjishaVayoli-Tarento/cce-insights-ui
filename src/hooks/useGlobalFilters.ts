import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';
import type { GlobalFilters } from '../api/types';

export function useGlobalFilters(): GlobalFilters {
  const ctx = useContext(FilterContext);
  return {
    startDate: ctx.startDate,
    endDate: ctx.endDate,
    facilityId: ctx.facilityId,
  };
}
