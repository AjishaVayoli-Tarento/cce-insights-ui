import { apiGet } from './client';
import type { FacilityRanking } from './types';

export interface DashboardOverview {
  totalPatientsEBuzima: number;
  patientsReceivedHIE: number;
  transmissionRate: number;
  activeFacilities: number;
  activeDeviations: number;
  newDeviations24h: number;
  hieEventCount: number;
  topFacilities: FacilityRanking[];
  bottomFacilities: FacilityRanking[];
}

export interface ComplianceMetric {
  trackedPatients: number;
  compliantPatients: number;
  nonCompliantPatients: number;
  complianceRate: number;
}

export interface FacilityComplianceMetric {
  trackedFacilities: number;
  compliantFacilities: number;
  nonCompliantFacilities: number;
  complianceRate: number;
}

export interface PractitionerComplianceMetric {
  trackedPractitioners: number;
  compliantPractitioners: number;
  nonCompliantPractitioners: number;
  complianceRate: number;
}

export interface DashboardComplianceSummary {
  patients: ComplianceMetric;
  facilities: FacilityComplianceMetric;
  practitioners: PractitionerComplianceMetric;
}

export function getDashboardOverview(params?: {
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DashboardOverview> {
  return apiGet('/dashboard/overview', params);
}

export function getDashboardComplianceSummary(): Promise<DashboardComplianceSummary> {
  return apiGet('/dashboard/compliance-summary');
}
