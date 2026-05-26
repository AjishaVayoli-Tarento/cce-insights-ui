import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { StatusBadge } from '../components/shared/StatusBadge';
import { CursorPagination } from '../components/shared/CursorPagination';
import { RiskHotspotChart } from '../components/charts/RiskHotspotChart';
import { useProtocolPatients } from '../hooks/useComplianceSummary';
import { useAtRiskHotspots, useRepeatDeviations } from '../hooks/usePatients';
import { useProtocols } from '../hooks/useLookups';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { COMPLIANCE_COLORS } from '../utils/colors';
import type { ComplianceCategory } from '../api/types';

export default function PatientList() {
  const [protocolId, setProtocolId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [page, setPage] = useState(1);
  const [minDeviations, setMinDeviations] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const protocols = useProtocols();
  const hotspots = useAtRiskHotspots({ limit: 10 });
  const patients = useProtocolPatients(protocolId, {
    status: statusFilter || undefined,
    cursor,
    limit: 20,
    patientId: activeSearch || undefined,
  });
  const repeats = useRepeatDeviations({ minDeviations, limit: 10 });

  return (
    <>
      <PageHeader title="Patient Compliance" description="Browse patients by compliance category and view at-risk hotspots" />

      <Card title="Risk Hotspots by Facility">
        {hotspots.isLoading ? <LoadingSpinner /> : hotspots.error ? <ErrorAlert error={hotspots.error} /> : hotspots.data ? (
          <RiskHotspotChart data={hotspots.data.data} />
        ) : null}
      </Card>

      <Card title="Patient List" className="mt-6">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Protocol</label>
            <select
              value={protocolId}
              onChange={(e) => { setProtocolId(e.target.value); setCursor(undefined); setCursorHistory([]); setPage(1); }}
              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a protocol...</option>
              {protocols.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.url.split('/').pop()} v{p.version}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-end">
            {['', 'on_track', 'at_risk', 'non_compliant'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCursor(undefined); setCursorHistory([]); setPage(1); }}
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
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Min Deviations (repeat)</label>
            <input
              type="number"
              min={1}
              value={minDeviations}
              onChange={(e) => setMinDeviations(Number(e.target.value))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
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

        {!protocolId && (
          <p className="py-4 text-center text-sm text-gray-400">Select a protocol to view patients.</p>
        )}

        {patients.isLoading && <LoadingSpinner />}
        {patients.error && <ErrorAlert error={patients.error} />}

        {patients.data && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Patient ID</th>
                    <th className="pb-2 pr-4">Category</th>
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
              onNext={(c) => { setCursorHistory((h) => [...h, cursor]); setCursor(c); setPage((prev) => prev + 1); }}
              onPrevious={() => { const prev = [...cursorHistory]; const prevCursor = prev.pop(); setCursorHistory(prev); setCursor(prevCursor); setPage((p) => p - 1); }}
              onReset={() => { setCursor(undefined); setCursorHistory([]); setPage(1); }}
              currentPage={page}
            />
          </>
        )}
      </Card>

      {repeats.data && repeats.data.data.length > 0 && (
        <Card title="Repeat Deviation Patients" className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-4">Patient ID</th>
                  <th className="pb-2 pr-4">Total Deviations</th>
                  <th className="pb-2 pr-4">Overdue</th>
                  <th className="pb-2 pr-4">Missed</th>
                  <th className="pb-2 pr-4">Order Violation</th>
                  <th className="pb-2">Facility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {repeats.data.data.map((r) => (
                  <tr key={r.patientId} className="hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <Link to={`/compliance/patients/${encodeURIComponent(r.patientId)}`} className="font-medium text-blue-600 hover:text-blue-700">
                        {r.patientId}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{formatNumber(r.totalDeviations)}</td>
                    <td className="py-2 pr-4">{formatNumber(r.overdueCount)}</td>
                    <td className="py-2 pr-4">{formatNumber(r.missedCount)}</td>
                    <td className="py-2 pr-4">{formatNumber(r.orderViolationCount)}</td>
                    <td className="py-2">{r.facilityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
