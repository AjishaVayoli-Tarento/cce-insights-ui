import { apiGet } from './client';

export interface IntelligenceSummary {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: number;
  avgLatencySeconds: number | null;
  byStatus: { label: string; count: number }[];
  byActionType: { label: string; count: number }[];
  bySeverity: { label: string; count: number }[];
  byDestination: { destination: string; count: number }[];
  activeAdaptors: { name: string; status: string; destinations: string[] }[];
}

export function getIntelligenceSummary(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<IntelligenceSummary> {
  return apiGet('/intelligence/summary', {
    startDate: params?.startDate,
    endDate: params?.endDate,
  });
}
