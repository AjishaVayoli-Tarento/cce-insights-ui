import { DEFAULT_PAGE_SIZE } from '../config';

export function buildCursorParams(params?: { limit?: number; cursor?: string }): {
  limit: string;
  cursor?: string;
} {
  return {
    limit: (params?.limit ?? DEFAULT_PAGE_SIZE).toString(),
    cursor: params?.cursor,
  };
}
