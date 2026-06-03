import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { CursorPagination } from '../components/shared/CursorPagination';
import { DeviationTrendChart } from '../components/charts/DeviationTrendChart';
import { useDeviationTrends, useDeviationsByAction } from '../hooks/useDeviations';
import { useActionOrder } from '../hooks/useProtocols';
import { useProtocols } from '../hooks/useLookups';
import { useGlobalFilters } from '../hooks/useGlobalFilters';
import { getDeviations } from '../api/deviations';
import { formatNumber } from '../utils/formatters';
import { formatDate } from '../utils/dates';
import { INTERVAL_OPTIONS } from '../config';

const ACTION_FILTER = (id: string) =>
  id.toLowerCase().includes('anc') && id.toLowerCase().includes('referral');

export default function CcnDeviations() {
  const [interval, setInterval] = useState('weekly');
  const [deviationType, setDeviationType] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [disputeMsg, setDisputeMsg] = useState<string | null>(null);
  const filters = useGlobalFilters();

  const trends = useDeviationTrends(interval);
  const byAction = useDeviationsByAction();
  const protocols = useProtocols();
  const protocolId = protocols.data?.[0]?.id ?? '';
  const actionOrder = useActionOrder(protocolId);

  const actionNameMap = useMemo(() => {
    const map = new Map<string, string>();
    actionOrder.data?.forEach((a) => {
      if (a.title) map.set(a.actionId, a.title);
    });
    return map;
  }, [actionOrder.data]);

  const getActionName = (actionId: string) => actionNameMap.get(actionId) || actionId;

  const filteredByAction = useMemo(
    () => byAction.data?.filter((a) => ACTION_FILTER(a.actionId)) ?? [],
    [byAction.data],
  );

  const metrics = useMemo(() => {
    const totals = { total: 0, overdue: 0, missed: 0, orderViolation: 0 };
    filteredByAction.forEach((a) => {
      totals.total += a.totalDeviations;
      totals.overdue += a.overdueCount;
      totals.missed += a.missedCount;
      totals.orderViolation += a.orderViolationCount;
    });
    return totals;
  }, [filteredByAction]);

  const deviationList = useQuery({
    queryKey: ['ccn', 'deviations', 'list', { deviationType, cursor, ...filters }],
    queryFn: () => getDeviations({
      deviationType: deviationType || undefined,
      ...filters,
      cursor,
      limit: 50,
    }),
  });

  const filteredList = useMemo(
    () => deviationList.data?.data.filter((d) => ACTION_FILTER(d.actionId)) ?? [],
    [deviationList.data],
  );

  const handleDispute = () => {
    setDisputeMsg('Facility Notified.');
    setTimeout(() => setDisputeMsg(null), 3000);
  };

  return (
    <>
      <PageHeader title="Deviation Analytics" description="ANC Visit Referral Closure deviations" />

      {disputeMsg && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-5 py-3 shadow-lg">
          <span className="text-sm font-medium text-green-800">{disputeMsg}</span>
          <button
            onClick={() => setDisputeMsg(null)}
            className="text-green-600 hover:text-green-800 text-lg font-bold leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {byAction.isLoading ? <LoadingSpinner /> : byAction.error ? <ErrorAlert error={byAction.error} /> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard title="Total Deviations" value={formatNumber(metrics.total)} description="Total ANC Visit Referral Closure deviations." />
          <MetricCard title="Overdue" value={formatNumber(metrics.overdue)} description="Referral closure steps not completed by the due date." />
          <MetricCard title="Missed" value={formatNumber(metrics.missed)} description="Referral closure steps that exceeded the maximum allowed window." />
          <MetricCard title="Order Violation" value={formatNumber(metrics.orderViolation)} description="Referral closure steps completed out of expected sequence." />
        </div>
      )}

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

      <div className="mt-6">
        <Card title="Most Deviated Steps">
          {byAction.isLoading ? <LoadingSpinner /> : byAction.error ? <ErrorAlert error={byAction.error} /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Total Deviations</th>
                    <th className="pb-2 pr-4">Overdue</th>
                    <th className="pb-2 pr-4">Missed</th>
                    <th className="pb-2">Order Violation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredByAction.map((a) => (
                    <tr key={a.actionId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{getActionName(a.actionId)}</td>
                      <td className="py-2 pr-4">{formatNumber(a.totalDeviations)}</td>
                      <td className="py-2 pr-4 text-amber-600">{formatNumber(a.overdueCount)}</td>
                      <td className="py-2 pr-4 text-red-600">{formatNumber(a.missedCount)}</td>
                      <td className="py-2 text-purple-600">{formatNumber(a.orderViolationCount)}</td>
                    </tr>
                  ))}
                  {filteredByAction.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-sm text-gray-500">No matching actions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Deviation List" className="mt-6">
        <div className="mb-4 flex gap-2">
          {[{ value: '', label: 'All Types' }, { value: 'OVERDUE', label: 'Overdue' }, { value: 'MISSED', label: 'Missed' }, { value: 'ORDER_VIOLATION', label: 'Order Violation' }].map((t) => (
            <button
              key={t.value}
              onClick={() => { setDeviationType(t.value); setCursor(undefined); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                deviationType === t.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
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
                    <th className="pb-2 pr-4">Reason</th>
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2 pr-4">Detected</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((d) => (
                    <tr key={d.deviationId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{d.patientId}</td>
                      <td className="py-2 pr-4">{getActionName(d.actionId)}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-bold ${d.deviationType === 'OVERDUE' ? 'text-amber-600' : d.deviationType === 'ORDER_VIOLATION' ? 'text-purple-600' : 'text-red-600'}`}>
                          {d.deviationType}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-red-600 font-medium">SLA Breached</td>
                      <td className="py-2 pr-4 text-gray-600">{d.facilityId}</td>
                      <td className="py-2 pr-4 text-gray-600">{formatDate(d.detectedAt)}</td>
                      <td className="py-2">
                        <button
                          onClick={handleDispute}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Request Follow-up
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No ANC Visit Referral Closure deviations found.</td></tr>
                  )}
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
