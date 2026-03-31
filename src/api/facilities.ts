import { apiGetPaginated } from './client';
import type { FacilityRanking, RankBy, SortOrder } from './types';

export function getFacilityRanking(params?: {
  protocolDefinitionId?: string;
  rankBy?: RankBy;
  order?: SortOrder;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiGetPaginated<FacilityRanking>('/facilities/ranking', {
    protocolDefinitionId: params?.protocolDefinitionId,
    rankBy: params?.rankBy,
    order: params?.order,
    startDate: params?.startDate,
    endDate: params?.endDate,
    limit: params?.limit?.toString(),
    cursor: params?.cursor,
  });
}
