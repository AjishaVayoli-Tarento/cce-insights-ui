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
import { formatNumber, formatPercentage } from '../utils/formatters';
import { COMPLIANCE_COLORS } from '../utils/colors';
import type { ComplianceCategory } from '../api/types';

export default function ComplianceOverview() {
  const [protocolId, setProtocolId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const summary = useProtocolComplianceSummary(protocolId);
  const patients = useProtocolPatients(protocolId, {
    status: statusFilter || undefined,
    cursor,
  });

  const data = summary.data;

  return (
    <>
      <PageHeader title="Compliance Overview" description="Protocol & facility compliance summaries" />

      <Card title="Protocol Compliance">
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">Select Protocol</label>
          <input
            type="text"
            value={protocolId}
            onChange={(e) => {
              setProtocolId(e.target.value);
              setCursor(undefined);
              setPage(1);
            }}
            placeholder="Enter Protocol Definition ID"
            className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {!protocolId && (
          <p className="py-6 text-center text-sm text-gray-400">Enter a Protocol Definition ID to view compliance.</p>
        )}

        {summary.isLoading && <LoadingSpinner />}
        {summary.error && <ErrorAlert error={summary.error} />}

        {data && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard title="Enrolled" value={formatNumber(data.totalEnrollments)} />
              <MetricCard title="Compliance Rate" value={formatPercentage(data.complianceRate)} />
              <MetricCard title="Active" value={formatNumber(data.statusBreakdown.active)} />
              <MetricCard title="Deviations" value={formatNumber(data.deviationCount)} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Status Breakdown</h4>
                <div className="space-y-1.5 text-sm">
                  {(Object.entries(data.statusBreakdown) as [string, number][]).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-gray-600">{status}</span>
                      <span className="font-medium text-gray-900">
                        {count} ({formatPercentage((count / data.totalEnrollments) * 100)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Step Metrics</h4>
                <div className="space-y-1.5 text-sm">
                  {Object.entries(data.stepMetrics)
                    .filter(([k]) => k !== 'totalSteps')
                    .map(([label, count]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="capitalize text-gray-600">{label.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium text-gray-900">{formatNumber(count as number)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to={`/compliance/protocols/${encodeURIComponent(protocolId)}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Protocol Analytics →
              </Link>
            </div>
          </>
        )}
      </Card>

      {protocolId && (
        <Card title="Patient Compliance" className="mt-6">
          <div className="mb-4 flex gap-2">
            {['', 'on_track', 'at_risk', 'non_compliant'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCursor(undefined);
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
                onNext={(c) => { setCursor(c); setPage((p) => p + 1); }}
                onReset={() => { setCursor(undefined); setPage(1); }}
                currentPage={page}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
}
