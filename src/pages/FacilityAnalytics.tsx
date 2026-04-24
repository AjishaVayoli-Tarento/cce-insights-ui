import { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { CursorPagination } from '../components/shared/CursorPagination';
import { RiskHotspotChart } from '../components/charts/RiskHotspotChart';
import { useFacilityRanking } from '../hooks/useFacilities';
import { useAtRiskHotspots } from '../hooks/usePatients';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { getFacilityName } from '../utils/facilityNames';
import { RANK_BY_OPTIONS, SORT_ORDER_OPTIONS } from '../config';
import type { RankBy, SortOrder, FacilityRanking } from '../api/types';

const RUHUHA_DUMMY: FacilityRanking = {
  rank: 0,
  facilityId: 'ruhuha-hc',
  totalEnrollments: 0,
  complianceRate: 0,
  activeDeviations: 0,
  totalEvents: 0,
};

export default function FacilityAnalytics() {
  const [rankBy, setRankBy] = useState<RankBy>('complianceRate');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [cursor, setCursor] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const ranking = useFacilityRanking({ rankBy, order, cursor });
  const hotspots = useAtRiskHotspots({ limit: 10 });

  return (
    <>
      <PageHeader title="Facility Analytics" description="Facility leaderboard and at-risk hotspots" />

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Rank By:</span>
          {RANK_BY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRankBy(opt.value as RankBy); setCursor(undefined); setPage(1); }}
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
          {SORT_ORDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setOrder(opt.value as SortOrder); setCursor(undefined); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                order === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Card title="Facility Ranking">
        {ranking.isLoading ? <LoadingSpinner /> : ranking.error ? <ErrorAlert error={ranking.error} /> : ranking.data ? (
          <>
            <div className="mb-6 space-y-2">
              {ranking.data.data.slice(0, 5).map((f) => (
                <div key={f.facilityId} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm font-bold text-gray-400">#{f.rank}</span>
                  <span className="w-24 text-sm font-medium text-gray-900 truncate" title={f.facilityName ?? f.facilityId}>{f.facilityName ?? f.facilityId}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.complianceRate}%` }} />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{formatPercentage(f.complianceRate)}</span>
                  <span className="w-20 text-right text-xs text-gray-500">{f.activeDeviations} devs</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Rank</th>
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2 pr-4">Tracked Patients</th>
                    <th className="pb-2 pr-4">Compliance</th>
                    <th className="pb-2 pr-4">Deviations</th>
                    <th className="pb-2 pr-4">Events</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...ranking.data.data, { ...RUHUHA_DUMMY, rank: ranking.data.data.length + 1 }].map((f) => {
                    const isInactive = f.facilityId === 'ruhuha-hc';
                    return (
                    <tr key={f.facilityId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-bold text-gray-400">{f.rank}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">{f.facilityName ?? getFacilityName(f.facilityId)}</td>
                      <td className="py-2 pr-4">{formatNumber(f.totalEnrollments)}</td>
                      <td className="py-2 pr-4">{formatPercentage(f.complianceRate)}</td>
                      <td className="py-2 pr-4">{formatNumber(f.activeDeviations)}</td>
                      <td className="py-2 pr-4">{formatNumber(f.totalEvents)}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isInactive
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {isInactive ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <CursorPagination
              hasMore={ranking.data.pagination.has_more}
              nextCursor={ranking.data.pagination.next_cursor}
              onNext={(c) => { setCursor(c); setPage((p) => p + 1); }}
              onReset={() => { setCursor(undefined); setPage(1); }}
              currentPage={page}
            />
          </>
        ) : null}
      </Card>

      <Card title="At-Risk Hotspots" className="mt-6">
        {hotspots.isLoading ? <LoadingSpinner /> : hotspots.error ? <ErrorAlert error={hotspots.error} /> : hotspots.data ? (
          <>
            <RiskHotspotChart data={hotspots.data.data} />
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Facility</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2 pr-4">On Track</th>
                    <th className="pb-2 pr-4">At Risk</th>
                    <th className="pb-2">Non-Compliant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hotspots.data.data.map((h) => (
                    <tr key={h.facilityId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{h.facilityName ?? h.facilityId}</td>
                      <td className="py-2 pr-4">{formatNumber(h.totalPatients)}</td>
                      <td className="py-2 pr-4 text-green-600">{h.onTrack.count} ({formatPercentage(h.onTrack.percentage)})</td>
                      <td className="py-2 pr-4 text-amber-600">{h.atRisk.count} ({formatPercentage(h.atRisk.percentage)})</td>
                      <td className="py-2 text-red-600">{h.nonCompliant.count} ({formatPercentage(h.nonCompliant.percentage)})</td>
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
