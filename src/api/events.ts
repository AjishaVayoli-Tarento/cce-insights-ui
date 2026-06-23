import { apiGet, apiGetPaginated } from './client';
import type {
  EventVolumeSummary, EventVolumeTrend, ResourceTypeCount,
  FacilityEventCount, PractitionerEventCount, SourceSystemCount,
  SourceComparison, ProcessingQuality, EventKpis,
} from './types';

export function getEventSummary(params?: {
  facilityId?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<EventVolumeSummary> {
  return apiGet('/events/summary', params);
}

export function getEventTrends(params?: {
  interval?: string;
  resourceType?: string;
  facilityId?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<EventVolumeTrend> {
  return apiGet('/events/trends', params);
}

export function getEventsByResourceType(params?: {
  facilityId?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ResourceTypeCount[]> {
  return apiGet('/events/by-resource-type', params);
}

export function getEventsByFacility(params?: {
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiGetPaginated<FacilityEventCount>('/events/by-facility', {
    resourceType: params?.resourceType,
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: params?.limit?.toString(),
    cursor: params?.cursor,
  });
}

export function getEventsByPractitioner(params?: {
  facilityId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiGetPaginated<PractitionerEventCount>('/events/by-practitioner', {
    facilityId: params?.facilityId,
    resourceType: params?.resourceType,
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: params?.limit?.toString(),
    cursor: params?.cursor,
  });
}

export function getEventsBySource(params?: {
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<SourceSystemCount[]> {
  return apiGet('/events/by-source', params);
}

export function compareSourceSystems(params: {
  sourceA: string;
  sourceB: string;
  windowSeconds?: number;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
  sampleLimit?: number;
}): Promise<SourceComparison> {
  return apiGet('/events/source-comparison', {
    sourceA: params.sourceA,
    sourceB: params.sourceB,
    windowSeconds: params.windowSeconds?.toString(),
    facilityId: params.facilityId,
    startDate: params.startDate,
    endDate: params.endDate,
    sampleLimit: params.sampleLimit?.toString(),
  });
}

export function getEventKpis(): Promise<EventKpis> {
  return apiGet('/events/kpis');
}

export function getProcessingQuality(params?: {
  source?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ProcessingQuality> {
  return apiGet('/events/processing-quality', params);
}
