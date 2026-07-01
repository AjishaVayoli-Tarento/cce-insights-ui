import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, installMswLifecycle } from '../test/mswServer';
import { getDashboardOverview, getDashboardComplianceSummary } from './dashboard';

/**
 * Endpoint-contract tests for the dashboard API functions: correct path + query shape sent, and
 * the {@code {data:...}} envelope mapped onto the typed result.
 */
describe('dashboard API', () => {
  installMswLifecycle();

  it('getDashboardOverview calls /dashboard/overview with the date+facility filters', async () => {
    let url: URL | undefined;
    server.use(http.get('*/v1/insights/dashboard/overview', ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({
        data: {
          totalPatientsEBuzima: 120,
          patientsReceivedHIE: 90,
          transmissionRate: 75.0,
          activeFacilities: 5,
          activeDeviations: 3,
          newDeviations24h: 1,
          hieEventCount: 900,
          topFacilities: [],
          bottomFacilities: [],
        },
      });
    }));

    const overview = await getDashboardOverview({
      facilityId: 'facility-002',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    });

    expect(url?.pathname).toBe('/v1/insights/dashboard/overview');
    expect(url?.searchParams.get('facilityId')).toBe('facility-002');
    expect(url?.searchParams.get('startDate')).toBe('2026-06-01');
    expect(url?.searchParams.get('endDate')).toBe('2026-06-30');
    expect(overview.transmissionRate).toBe(75.0);
    expect(overview.activeFacilities).toBe(5);
  });

  it('getDashboardComplianceSummary maps the nested compliance metrics', async () => {
    server.use(http.get('*/v1/insights/dashboard/compliance-summary', () =>
      HttpResponse.json({
        data: {
          patients: { trackedPatients: 100, compliantPatients: 80, nonCompliantPatients: 20, complianceRate: 80 },
          facilities: { trackedFacilities: 5, above90: 2, between75And90: 2, below75: 1 },
          practitioners: { trackedPractitioners: 10, above90: 6, between75And90: 3, below75: 1 },
        },
      })));

    const summary = await getDashboardComplianceSummary({ startDate: '2026-06-01', endDate: '2026-06-30' });

    expect(summary.patients.compliantPatients).toBe(80);
    expect(summary.facilities.below75).toBe(1);
    expect(summary.practitioners.above90).toBe(6);
  });
});
