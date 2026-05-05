import { apiGet, apiGetPaginated } from './client';
import type {
  DeviationRecord, DeviationTrend, DeviationByAction,
  DeviationResolution, IntelligenceSummary,
} from './types';

export function getDeviations(params?: {
  deviationType?: string;
  facilityId?: string;
  protocolDefinitionId?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiGetPaginated<DeviationRecord>('/deviations', {
    deviationType: params?.deviationType,
    facilityId: params?.facilityId,
    protocolDefinitionId: params?.protocolDefinitionId,
    startDate: params?.startDate,
    endDate: params?.endDate,
    sort: params?.sort,
    limit: params?.limit?.toString(),
    cursor: params?.cursor,
  });
}

export function getDeviationTrends(params?: {
  interval?: string;
  facilityId?: string;
  protocolDefinitionId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DeviationTrend> {
  return apiGet('/deviations/trends', {
    interval: params?.interval,
    facilityId: params?.facilityId,
    protocolDefinitionId: params?.protocolDefinitionId,
    startDate: params?.startDate,
    endDate: params?.endDate,
  });
}

export function getDeviationsByAction(params?: {
  protocolDefinitionId?: string;
  deviationType?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<DeviationByAction[]> {
  return apiGet('/deviations/by-action', {
    protocolDefinitionId: params?.protocolDefinitionId,
    deviationType: params?.deviationType,
    facilityId: params?.facilityId,
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: params?.limit?.toString(),
  });
}

export function getDeviationResolutionRate(params?: {
  protocolDefinitionId?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DeviationResolution> {
  return apiGet('/deviations/resolution-rate', {
    protocolDefinitionId: params?.protocolDefinitionId,
    facilityId: params?.facilityId,
    startDate: params?.startDate,
    endDate: params?.endDate,
  });
}

export function getIntelligenceSummary(): Promise<IntelligenceSummary> {
  return apiGet('/deviations/intelligence-summary');
}
