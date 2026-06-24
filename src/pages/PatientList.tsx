import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { StatusBadge } from '../components/shared/StatusBadge';
import { PagePagination } from '../components/shared/PagePagination';
import { useProtocolPatients } from '../hooks/useComplianceSummary';
import { useProtocols } from '../hooks/useLookups';
import { formatPercentage } from '../utils/formatters';
import { COMPLIANCE_COLORS } from '../utils/colors';
import { DEFAULT_TABLE_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../config';
import type { ComplianceCategory } from '../api/types';

export default function PatientList() {
  const [protocolId, setProtocolId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const protocols = useProtocols();
  const cursor = page > 1 ? String((page - 1) * pageSize) : undefined;

  useEffect(() => {
    if (!protocolId && protocols.data && protocols.data.length > 0) {
      setProtocolId(protocols.data[0].id);
    }
  }, [protocols.data, protocolId]);

  const patients = useProtocolPatients(protocolId, {
    status: statusFilter || undefined,
    cursor,
    limit: pageSize,
    patientId: activeSearch || undefined,
  });

  const totalCount = patients.data?.pagination.total_count;
  const rowCount = patients.data?.data.length ?? 0;
  const totalPages = totalCount != null
    ? Math.max(1, Math.ceil(totalCount / pageSize))
    : Math.max(page, patients.data?.pagination.has_more ? page + 1 : page);

  const range = useMemo(() => {
    if (rowCount === 0) {
      return { start: 0, end: 0 };
    }
    const start = (page - 1) * pageSize + 1;
    const end = totalCount != null
      ? Math.min(page * pageSize, totalCount)
      : start + rowCount - 1;
    return { start, end };
  }, [rowCount, page, pageSize, totalCount]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetPagination = () => setPage(1);

  const canNext = totalCount != null
    ? page < totalPages
    : Boolean(patients.data?.pagination.has_more);

  return (
    <>
      <PageHeader title="Patient Compliance" description="Browse patients by compliance category" />

      <Card title="Patient List">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Protocol</label>
            <select
              value={protocolId}
              onChange={(e) => { setProtocolId(e.target.value); resetPagination(); }}
              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a protocol...</option>
              {protocols.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.url.split('/').pop()} (v{p.version})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-end">
            {['', 'on_track', 'non_compliant'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatusFilter(s); resetPagination(); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === '' ? 'All' : s === 'on_track' ? 'Compliant' : 'Non-Compliant'}
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveSearch(searchTerm.trim());
              resetPagination();
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
                  resetPagination();
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

        {protocolId && patients.isPending && <LoadingSpinner />}
        {patients.error && <ErrorAlert error={patients.error} />}

        {protocolId && patients.data && (
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
                          label={p.complianceCategory === 'on_track' ? 'Compliant' : 'Non-Compliant'}
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
            {rowCount === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No patients match the current filters.</p>
            )}
            <PagePagination
              pageSize={pageSize}
              pageSizeOptions={[...TABLE_PAGE_SIZE_OPTIONS]}
              onPageSizeChange={(size) => { setPageSize(size); resetPagination(); }}
              start={range.start}
              end={range.end}
              totalCount={totalCount}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
              canPrevious={page > 1}
              canNext={canNext}
            />
          </>
        )}
      </Card>
    </>
  );
}
