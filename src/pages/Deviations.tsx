import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { CursorPagination } from '../components/shared/CursorPagination';
import { DeviationTrendChart } from '../components/charts/DeviationTrendChart';
import { useIntelligenceSummary, useDeviationTrends, useDeviationsByAction, useDeviationResolution } from '../hooks/useDeviations';
import { useGlobalFilters } from '../hooks/useGlobalFilters';
import { getDeviations } from '../api/deviations';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { formatDate } from '../utils/dates';
import { INTERVAL_OPTIONS } from '../config';

export default function Deviations() {
  const [interval, setInterval] = useState('weekly');
  const [deviationType, setDeviationType] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const filters = useGlobalFilters();

  const intel = useIntelligenceSummary();
  const trends = useDeviationTrends(interval);
  const byAction = useDeviationsByAction();
  const resolution = useDeviationResolution();

  const deviationList = useQuery({
    queryKey: ['deviations', 'list', { deviationType, cursor, ...filters }],
    queryFn: () => getDeviations({
      deviationType: deviationType || undefined,
      ...filters,
      cursor,
    }),
  });

  return (
    <>
      <PageHeader title="Deviation Analytics" description="Trends, most-deviated steps, resolution rate" />

      {intel.isLoading ? <LoadingSpinner /> : intel.error ? <ErrorAlert error={intel.error} /> : intel.data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard title="Total Deviations" value={formatNumber(intel.data.totalDeviations)} />
          <MetricCard title="Overdue" value={formatNumber(intel.data.byType?.overdue ?? 0)} />
          <MetricCard title="Missed" value={formatNumber(intel.data.byType?.missed ?? 0)} />
          <MetricCard
            title="Resolution Rate"
            value={resolution.data ? formatPercentage(resolution.data.resolved.percentage) : '—'}
            subtitle={resolution.data ? `Avg ${resolution.data.resolved.avgDaysToResolve.toFixed(1)} days` : undefined}
          />
        </div>
      ) : null}

      <Card title="Deviation Trends" className="mt-6"
        action={
          <div className="flex gap-1">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInterval(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  interval === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      >
        {trends.isLoading ? <LoadingSpinner /> : trends.data ? (
          <DeviationTrendChart data={trends.data.trends} />
        ) : null}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Most Deviated Steps">
          {byAction.isLoading ? <LoadingSpinner /> : byAction.error ? <ErrorAlert error={byAction.error} /> : byAction.data ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2 pr-4">Overdue</th>
                    <th className="pb-2">Missed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {byAction.data.map((a) => (
                    <tr key={a.actionId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{a.actionId}</td>
                      <td className="py-2 pr-4">{formatNumber(a.totalDeviations)}</td>
                      <td className="py-2 pr-4 text-amber-600">{formatNumber(a.overdueCount)}</td>
                      <td className="py-2 text-red-600">{formatNumber(a.missedCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <Card title="Resolution Rate">
          {resolution.isLoading ? <LoadingSpinner /> : resolution.error ? <ErrorAlert error={resolution.error} /> : resolution.data ? (
            <div>
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${resolution.data.resolved.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">
                  {formatPercentage(resolution.data.resolved.percentage)} Resolved ({formatNumber(resolution.data.resolved.count)})
                </span>
                <span className="text-red-600 font-medium">
                  {formatPercentage(resolution.data.escalatedToMissed.percentage)} Escalated ({formatNumber(resolution.data.escalatedToMissed.count)})
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Average days to resolve: {resolution.data.resolved.avgDaysToResolve.toFixed(1)}
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      <Card title="Deviation List" className="mt-6">
        <div className="mb-4 flex gap-2">
          {['', 'overdue', 'missed'].map((t) => (
            <button
              key={t}
              onClick={() => { setDeviationType(t); setCursor(undefined); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                deviationType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === '' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {deviationList.isLoading && <LoadingSpinner />}
        {deviationList.error && <ErrorAlert error={deviationList.error} />}

        {deviationList.data && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Patient</th>
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2">Detected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deviationList.data.data.map((d) => (
                    <tr key={d.deviationId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4">
                        <Link to={`/compliance/patients/${encodeURIComponent(d.patientId)}`} className="font-medium text-blue-600 hover:text-blue-700">
                          {d.patientId}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{d.actionId}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-bold ${d.deviationType === 'OVERDUE' ? 'text-amber-600' : 'text-red-600'}`}>
                          {d.deviationType}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{d.facilityId}</td>
                      <td className="py-2 text-gray-600">{formatDate(d.detectedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CursorPagination
              hasMore={deviationList.data.pagination.has_more}
              nextCursor={deviationList.data.pagination.next_cursor}
              onNext={(c) => { setCursor(c); setPage((p) => p + 1); }}
              onReset={() => { setCursor(undefined); setPage(1); }}
              currentPage={page}
            />
          </>
        )}
      </Card>
    </>
  );
}
