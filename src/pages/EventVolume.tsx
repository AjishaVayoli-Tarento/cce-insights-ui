import { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { CursorPagination } from '../components/shared/CursorPagination';
import { EventTrendChart } from '../components/charts/EventTrendChart';
import { ResourceTypeBarChart } from '../components/charts/ResourceTypeBarChart';
import {
  useEventKpis, useEventTrends, useEventsByResourceType, useEventsByFacility,
} from '../hooks/useEventVolume';
import { formatNumber } from '../utils/formatters';
import { INTERVAL_OPTIONS } from '../config';

type Tab = 'resource-type' | 'facility';

export default function EventVolume() {
  const [interval, setInterval] = useState('weekly');
  const [activeTab, setActiveTab] = useState<Tab>('resource-type');
  const [facilityCursor, setFacilityCursor] = useState<string | undefined>();
  const [facilityPage, setFacilityPage] = useState(1);

  const kpis = useEventKpis();
  const trends = useEventTrends(interval);
  const byResourceType = useEventsByResourceType();
  const byFacility = useEventsByFacility({ cursor: facilityCursor });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resource-type', label: 'By Resource Type' },
    { key: 'facility', label: 'By Facility' },
  ];

  return (
    <>
      <PageHeader title="Event Volume & Activity" description="Clinical event metrics — volume by resource type and facility" />

      {kpis.isLoading ? <LoadingSpinner /> : kpis.error ? <ErrorAlert error={kpis.error} /> : kpis.data ? (
        <>
          <div className="mb-1 text-xs text-gray-400">Today's snapshot — not affected by the date filter above</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard title="Total Events" value={formatNumber(kpis.data.totalEvents)} description="Cumulative inbound clinical events (FHIR resources) accepted by the HIE pipeline." />
            <MetricCard title="Matched Rate" value={`${Number(kpis.data.matchedRatePct).toFixed(2)}%`} description="Percentage of events successfully matched to a protocol step instance." bgColor="bg-green-50" />
            <MetricCard title="Zero Match Rate" value={`${Number(kpis.data.zeroMatchRatePct).toFixed(2)}%`} description="Percentage of events that could not be matched to any protocol step (no eligible patient or step found)." bgColor="bg-amber-50" />
            <MetricCard title="Duplicates" value={formatNumber(kpis.data.duplicateCount)} description="Events identified as duplicates of a previously received event — not processed again." bgColor="bg-purple-50" />
            <MetricCard title="Pipeline Loss" value={formatNumber(kpis.data.pipelineLossCount)} description="Events accepted by the collector but never reaching the compliance engine — indicates a processing gap." bgColor={kpis.data.pipelineLossCount > 0 ? 'bg-red-50' : undefined} />
          </div>
        </>
      ) : null}

      <Card title="Volume Trends" className="mt-6"
        action={
          <div className="flex gap-1">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInterval(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  interval === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      >
        {trends.isLoading ? <LoadingSpinner /> : trends.error ? <ErrorAlert error={trends.error} /> : trends.data ? (
          <EventTrendChart data={trends.data.trends} />
        ) : null}
      </Card>

      <div className="mt-6">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'resource-type' && (
            <Card>
              {byResourceType.isLoading ? <LoadingSpinner /> : byResourceType.error ? <ErrorAlert error={byResourceType.error} /> : byResourceType.data ? (
                <ResourceTypeBarChart data={byResourceType.data} />
              ) : null}
            </Card>
          )}

          {activeTab === 'facility' && (
            <Card>
              {byFacility.isLoading ? <LoadingSpinner /> : byFacility.error ? <ErrorAlert error={byFacility.error} /> : byFacility.data ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                          <th className="pb-2 pr-4">Facility</th>
                          <th className="pb-2 pr-4">Total Events</th>
                          <th className="pb-2">Resource Types</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {byFacility.data.data.map((f) => (
                          <tr key={f.facilityId} className="hover:bg-gray-50">
                            <td className="py-2 pr-4 font-medium text-gray-900">{f.facilityId}</td>
                            <td className="py-2 pr-4">{formatNumber(f.totalEvents)}</td>
                            <td className="py-2 text-gray-600">{f.byResourceType.map((r) => `${r.resourceType}: ${r.count}`).join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <CursorPagination
                    hasMore={byFacility.data.pagination.has_more}
                    nextCursor={byFacility.data.pagination.next_cursor}
                    onNext={(c) => { setFacilityCursor(c); setFacilityPage((p) => p + 1); }}
                    onReset={() => { setFacilityCursor(undefined); setFacilityPage(1); }}
                    currentPage={facilityPage}
                  />
                </>
              ) : null}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
