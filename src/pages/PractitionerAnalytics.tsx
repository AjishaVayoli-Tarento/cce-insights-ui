import { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { usePractitionerRanking } from '../hooks/usePractitioners';
import { formatNumber, formatPercentage } from '../utils/formatters';
import type { PractitionerRankBy, SortOrder } from '../api/types';

const RANK_OPTIONS: { value: PractitionerRankBy; label: string }[] = [
  { value: 'complianceRate', label: 'Compliance Rate' },
  { value: 'totalPatients', label: 'Patients Served' },
  { value: 'totalEvents', label: 'Event Volume' },
];

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'desc', label: 'Highest First' },
  { value: 'asc', label: 'Lowest First' },
];

function formatPractitionerName(ref: string, display: string | null): string {
  if (display) return display;
  // Extract ID from reference like "Practitioner/HLC-PRAC-2025-00005"
  const parts = ref.split('/');
  return parts.length > 1 ? parts[1] : ref;
}

export default function PractitionerAnalytics() {
  const [rankBy, setRankBy] = useState<PractitionerRankBy>('complianceRate');
  const [order, setOrder] = useState<SortOrder>('desc');

  const ranking = usePractitionerRanking({ rankBy, order, limit: 50 });

  return (
    <>
      <PageHeader title="Practitioner Analytics" description="Practitioner leaderboard ranked by compliance performance" />

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Rank By:</span>
          {RANK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRankBy(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                rankBy === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Order:</span>
          {ORDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOrder(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                order === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Card title="Practitioner Ranking">
        {ranking.isLoading ? <LoadingSpinner /> : ranking.error ? <ErrorAlert error={ranking.error} /> : ranking.data ? (
          <>
            {/* Top 5 bar chart */}
            <div className="mb-6 space-y-2">
              {ranking.data.slice(0, 5).map((p) => (
                <div key={p.practitionerRef} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm font-bold text-gray-400">#{p.rank}</span>
                  <span className="w-36 text-sm font-medium text-gray-900 truncate" title={p.practitionerName ?? p.practitionerRef}>
                    {formatPractitionerName(p.practitionerRef, p.practitionerName)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${p.complianceRate}%` }} />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{formatPercentage(p.complianceRate)}</span>
                  <span className="w-20 text-right text-xs text-gray-500">{formatNumber(p.totalPatients)} pts</span>
                </div>
              ))}
            </div>

            {/* Full table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Rank</th>
                    <th className="pb-2 pr-4">Practitioner</th>
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2 pr-4">Patients</th>
                    <th className="pb-2 pr-4">Compliance</th>
                    <th className="pb-2 pr-4">Steps (Done/Total)</th>
                    <th className="pb-2">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ranking.data.map((p) => (
                    <tr key={p.practitionerRef} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-bold text-gray-400">{p.rank}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {formatPractitionerName(p.practitionerRef, p.practitionerName)}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{p.facilityId ?? '—'}</td>
                      <td className="py-2 pr-4">{formatNumber(p.totalPatients)}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.complianceRate >= 80 ? 'bg-green-50 text-green-700' :
                          p.complianceRate >= 50 ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {formatPercentage(p.complianceRate)}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{formatNumber(p.completedSteps)} / {formatNumber(p.totalSteps)}</td>
                      <td className="py-2">{formatNumber(p.totalEvents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </Card>
    </>
  );
}
