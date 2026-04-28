import { apiGet } from './client';
import type { FacilityRanking } from './types';

export interface DashboardOverview {
  totalPatientsEBuzima: number;
  patientsReceivedHIE: number;
  transmissionRate: number;
  activeFacilities: number;
  activeDeviations: number;
  newDeviations24h: number;
  topFacilities: FacilityRanking[];
  bottomFacilities: FacilityRanking[];
}

export function getDashboardOverview(params?: {
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DashboardOverview> {
  return apiGet('/dashboard/overview', params);
}
