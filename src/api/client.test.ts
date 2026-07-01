import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, installMswLifecycle } from '../test/mswServer';
import { apiGet, apiGetPaginated, ApiError } from './client';

/**
 * API-integration tests for the Insights UI API client, against a mocked network layer (MSW).
 * Verifies the real response-envelope contract: {@code apiGet} unwraps {@code {data:...}},
 * {@code apiGetPaginated} normalizes snake_case/camelCase pagination, and error envelopes
 * ({@code {error:{code,message}}}) surface as {@link ApiError}.
 */
describe('Insights UI API client', () => {
  installMswLifecycle();

  it('apiGet unwraps the {data:...} success envelope', async () => {
    server.use(http.get('*/v1/insights/dashboard/overview', () =>
      HttpResponse.json({ data: { activeFacilities: 5, transmissionRate: 42.5 } })));

    const result = await apiGet<{ activeFacilities: number }>('/dashboard/overview');

    expect(result).toEqual({ activeFacilities: 5, transmissionRate: 42.5 });
  });

  it('apiGet returns the raw body when there is no data envelope', async () => {
    server.use(http.get('*/v1/insights/ping', () => HttpResponse.json({ status: 'ok' })));

    expect(await apiGet('/ping')).toEqual({ status: 'ok' });
  });

  it('apiGet sends Accept: application/json and forwards non-empty query params', async () => {
    let captured: URL | undefined;
    let acceptHeader: string | null = null;
    server.use(http.get('*/v1/insights/dashboard/overview', ({ request }) => {
      captured = new URL(request.url);
      acceptHeader = request.headers.get('Accept');
      return HttpResponse.json({ data: {} });
    }));

    await apiGet('/dashboard/overview', { facilityId: 'facility-001', startDate: '', endDate: undefined });

    expect(acceptHeader).toBe('application/json');
    expect(captured?.searchParams.get('facilityId')).toBe('facility-001');
    // Empty / undefined params are dropped, not sent as blanks.
    expect(captured?.searchParams.has('startDate')).toBe(false);
    expect(captured?.searchParams.has('endDate')).toBe(false);
  });

  it('apiGetPaginated normalizes snake_case pagination', async () => {
    server.use(http.get('*/v1/insights/patients', () =>
      HttpResponse.json({
        data: [{ id: 'p1' }],
        pagination: { limit: 25, next_cursor: 'abc', has_more: true, total_count: 100 },
      })));

    const page = await apiGetPaginated<{ id: string }>('/patients');

    expect(page.data).toHaveLength(1);
    expect(page.pagination).toEqual({
      limit: 25,
      next_cursor: 'abc',
      has_more: true,
      total_count: 100,
    });
  });

  it('apiGetPaginated accepts camelCase pagination keys too', async () => {
    server.use(http.get('*/v1/insights/patients', () =>
      HttpResponse.json({
        data: [],
        pagination: { limit: 10, nextCursor: 'xyz', hasMore: false, totalCount: 0 },
      })));

    const page = await apiGetPaginated('/patients');

    expect(page.pagination.next_cursor).toBe('xyz');
    expect(page.pagination.has_more).toBe(false);
  });

  it('apiGetPaginated defaults pagination when the server omits it', async () => {
    server.use(http.get('*/v1/insights/patients', () => HttpResponse.json({ data: [] })));

    const page = await apiGetPaginated('/patients');

    expect(page.pagination).toEqual({ limit: 50, next_cursor: null, has_more: false });
  });

  it('throws ApiError with the unwrapped error envelope on 4xx', async () => {
    server.use(http.get('*/v1/insights/patients', () =>
      HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'bad interval' } },
        { status: 400 })));

    await expect(apiGet('/patients')).rejects.toSatisfy((e) => {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(400);
      expect(err.body.code).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('bad interval');
      return true;
    });
  });

  it('throws ApiError on a 5xx with a non-JSON body', async () => {
    server.use(http.get('*/v1/insights/patients', () =>
      HttpResponse.text('gateway boom', { status: 503 })));

    await expect(apiGet('/patients')).rejects.toSatisfy((e) => {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(503);
      return true;
    });
  });
});
