import { buildUrl } from './client';

export function getExportUrl(params: {
  format: 'json' | 'csv';
  protocolDefinitionId?: string;
  facilityId?: string;
  startDate?: string;
  endDate?: string;
}): string {
  return buildUrl('/exports/compliance-report', {
    format: params.format,
    protocolDefinitionId: params.protocolDefinitionId,
    facilityId: params.facilityId,
    startDate: params.startDate,
    endDate: params.endDate,
  });
}
