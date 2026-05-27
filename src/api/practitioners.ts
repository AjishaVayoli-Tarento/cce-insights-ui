import { apiGet } from './client';
import type { PractitionerRanking } from './types';

export function getPractitionerRanking(params?: {
  rankBy?: string;
  order?: string;
  limit?: number;
}) {
  return apiGet<PractitionerRanking[]>('/practitioners/ranking', {
    rankBy: params?.rankBy,
    order: params?.order,
    limit: params?.limit?.toString(),
  });
}
