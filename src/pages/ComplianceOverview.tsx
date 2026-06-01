import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { StatusBadge } from '../components/shared/StatusBadge';
import { CursorPagination } from '../components/shared/CursorPagination';
import { useProtocolComplianceSummary, useProtocolPatients } from '../hooks/useComplianceSummary';
import { useStepAnalytics, useActionOrder } from '../hooks/useProtocols';
import { useProtocols } from '../hooks/useLookups';
import { formatNumber, formatPercentage, formatRate } from '../utils/formatters';
import { COMPLIANCE_COLORS } from '../utils/colors';
import type { ComplianceCategory } from '../api/types';

export default function ComplianceOverview() {
  const [protocolId, setProtocolId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const protocols = useProtocols();
  const summary = useProtocolComplianceSummary(protocolId);
  const stepAnalytics = useStepAnalytics(protocolId);
  const actionOrder = useActionOrder(protocolId);
  const patients = useProtocolPatients(protocolId, {
    status: statusFilter || undefined,
    cursor,
    limit: 20,
    patientId: activeSearch || undefined,
  });

  const data = summary.data;

  return (
    <>
      <PageHeader title="Compliance Overview" description="Protocol & facility compliance summaries" />

      <Card title="Protocol Compliance">
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Select Protocol</label>
          <select
            value={protocolId}
            onChange={(e) => {
              setProtocolId(e.target.value);
              setCursor(undefined);
              setCursorHistory([]);
              setPage(1);
            }}
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a protocol...</option>
            {protocols.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.url.split('/').pop()} (v{p.version} - {p.status})
              </option>
            ))}
          </select>
        </div>

        {!protocolId && (
          <p className="py-6 text-center text-sm text-gray-400">Select a protocol to view compliance.</p>
        )}

        {summary.isLoading && <LoadingSpinner />}
        {summary.error && <ErrorAlert error={summary.error} />}

        {data && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard title="Tracked Patients" value={formatNumber(data.totalEnrollments)} description="Total number of patients enrolled and being tracked under this protocol." />
              <MetricCard title="Compliant Patients" value={formatNumber(data.compliantPatients)} denomination={formatNumber(data.totalEnrollments)} description="Patients with no deviations (overdue, missed, or order violations) under this protocol." />
              <MetricCard title="Non-Compliant Patients" value={formatNumber(data.deviationCount)} denomination={formatNumber(data.totalEnrollments)} description="Patients with at least one deviation (overdue, missed, or order violation) under this protocol." />
              <MetricCard title="Compliance Rate" value={formatRate(data.complianceRate)} description="Percentage of compliant patients out of total tracked patients under this protocol." />
            </div>

            <div className="mt-1">
              <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase">Transactions</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(data.stepMetrics.totalSteps)}</p>
                  <p className="mt-0.5 text-xs font-medium text-gray-600">Total Steps</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                    <div className="h-full rounded-full bg-gray-400" style={{ width: '100%' }} />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500">Total applicable steps across all tracked patients where some could be optional.</p>
                </div>
                {(() => {
                  const completed = data.stepMetrics.completed ?? 0;
                  const onTime = (data.stepMetrics.onTime ?? 0) + (data.stepMetrics.early ?? 0);
                  const late = data.stepMetrics.late ?? 0;
                  const overdue = data.stepMetrics.overdue ?? 0;
                  const missed = data.stepMetrics.missed ?? 0;
                  const totalSteps = data.stepMetrics.totalSteps || 1;
                  const completedOrOne = completed || 1;

                  const tiles = [
                    { key: 'completed', label: 'Completed', value: completed, denom: totalSteps, denomBase: totalSteps, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { key: 'onTime', label: 'On Time', value: onTime, denom: completed, denomBase: completedOrOne, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                    { key: 'late', label: 'Late', value: late, denom: completed, denomBase: completedOrOne, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                    { key: 'overdue', label: 'Overdue', value: overdue, denom: totalSteps, denomBase: totalSteps, color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
                    { key: 'missed', label: 'Missed', value: missed, denom: totalSteps, denomBase: totalSteps, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
                  ];

                  return tiles.map(({ key, label, value, denom, denomBase, color, text, bg }) => {
                    const pct = Math.round((value / denomBase) * 100);
                    return (
                      <div key={key} className={`rounded-lg ${bg} p-3`}>
                        <p className={`text-2xl font-bold ${text}`}>
                          {formatNumber(value)}
                          <span className="text-sm font-normal text-gray-400">/{formatNumber(denom)}</span>
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-gray-600">{label}</p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-[10px] text-gray-500">{pct}% of {formatNumber(denom)} steps</p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Service Workflow Compliance */}
            {stepAnalytics.data && stepAnalytics.data.steps.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase">Service Workflow Compliance</h4>
                  <span className="text-xs text-gray-500">Mandatory steps must be recorded</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(() => {
                    const order = actionOrder.data ?? [];
                    const orderMap = new Map(order.map((id, idx) => [id, idx]));
                    return [...stepAnalytics.data.steps]
                      .filter((s) => s.totalInstances > 0)
                      .sort((a, b) => (orderMap.get(a.actionId) ?? 999) - (orderMap.get(b.actionId) ?? 999));
                  })().map((step) => {
                      const pct = Math.round(step.completionRate * 100);
                      const missing = step.totalInstances - step.completedCount;
                      const label = step.actionId
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={step.actionId} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                          <DonutRing pct={pct} size={80} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{label}</p>
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-900">{step.completedCount}</span>
                              {' / '}
                              <span className="font-semibold text-gray-900">{step.totalInstances}</span>
                              {' completed'}
                            </p>
                            {missing > 0 && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {missing} patient{missing !== 1 ? 's' : ''} missing
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {protocolId && (
        <Card title="Patient Compliance" className="mt-6">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div className="flex gap-2 items-end">
              {['', 'on_track', 'at_risk', 'non_compliant'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCursor(undefined);
                    setCursorHistory([]);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === '' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveSearch(searchTerm.trim());
                setCursor(undefined);
                setCursorHistory([]);
                setPage(1);
              }}
              className="flex items-end gap-2"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Search Patient</label>
                <input
                  type="text"
                  placeholder="Enter patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveSearch('');
                    setCursor(undefined);
                    setCursorHistory([]);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {patients.isLoading && <LoadingSpinner />}
          {patients.error && <ErrorAlert error={patients.error} />}

          {patients.data && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                      <th className="pb-2 pr-4">Patient ID</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Rate</th>
                      <th className="pb-2 pr-4">Steps</th>
                      <th className="pb-2">Deviations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patients.data.data.map((p) => (
                      <tr key={`${p.patientId}-${p.protocolInstanceId}`} className="hover:bg-gray-50">
                        <td className="py-2 pr-4">
                          <Link to={`/compliance/patients/${encodeURIComponent(p.patientId)}`} className="font-medium text-blue-600 hover:text-blue-700">
                            {p.patientId}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <StatusBadge
                            label={p.complianceCategory.replace(/_/g, ' ')}
                            color={COMPLIANCE_COLORS[p.complianceCategory as ComplianceCategory] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                          />
                        </td>
                        <td className="py-2 pr-4">{formatPercentage(p.complianceRate)}</td>
                        <td className="py-2 pr-4">{p.stepsCompleted}/{p.totalSteps}</td>
                        <td className="py-2">{p.activeDeviations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CursorPagination
                hasMore={patients.data.pagination.has_more}
                nextCursor={patients.data.pagination.next_cursor}
                onNext={(c) => { setCursorHistory((h) => [...h, cursor]); setCursor(c); setPage((p) => p + 1); }}
                onPrevious={() => { const prev = [...cursorHistory]; const prevCursor = prev.pop(); setCursorHistory(prev); setCursor(prevCursor); setPage((p) => p - 1); }}
                onReset={() => { setCursor(undefined); setCursorHistory([]); setPage(1); }}
                currentPage={page}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
}

function DonutRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? '#0d9488' : pct >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}
