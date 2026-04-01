import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { CursorPagination } from '../components/shared/CursorPagination';
import { EventTrendChart } from '../components/charts/EventTrendChart';
import { ResourceTypeBarChart } from '../components/charts/ResourceTypeBarChart';
import { ProcessingQualityChart } from '../components/charts/ProcessingQualityChart';
import {
  useEventSummary, useEventTrends, useEventsByResourceType,
  useEventsByFacility, useEventsByPractitioner, useEventsBySource, useProcessingQuality,
} from '../hooks/useEventVolume';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { INTERVAL_OPTIONS } from '../config';

type Tab = 'resource-type' | 'facility' | 'practitioner' | 'source' | 'processing-quality';

export default function EventVolume() {
  const [interval, setInterval] = useState('weekly');
  const [activeTab, setActiveTab] = useState<Tab>('resource-type');
  const [facilityCursor, setFacilityCursor] = useState<string | undefined>();
  const [facilityPage, setFacilityPage] = useState(1);
  const [practCursor, setPractCursor] = useState<string | undefined>();
  const [practPage, setPractPage] = useState(1);

  const summary = useEventSummary();
  const trends = useEventTrends(interval);
  const byResourceType = useEventsByResourceType();
  const byFacility = useEventsByFacility({ cursor: facilityCursor });
  const byPractitioner = useEventsByPractitioner({ cursor: practCursor });
  const bySource = useEventsBySource();
  const quality = useProcessingQuality();

  const events = summary.data;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resource-type', label: 'By Resource Type' },
    { key: 'facility', label: 'By Facility' },
    { key: 'practitioner', label: 'By Practitioner' },
    { key: 'source', label: 'By Source' },
    { key: 'processing-quality', label: 'Processing Quality' },
  ];

  return (
    <>
      <PageHeader title="Event Volume & Activity" description="Clinical event metrics — volume by resource type, facility, practitioner, source" />

      {summary.isLoading ? <LoadingSpinner /> : summary.error ? <ErrorAlert error={summary.error} /> : events ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard title="Total Events" value={formatNumber(events.totalEvents)} />
          <MetricCard title="Matched Rate" value={events.processingStatusBreakdown?.matched ? formatPercentage(events.processingStatusBreakdown.matched.percentage) : '—'} />
          <MetricCard title="Zero Match" value={events.processingStatusBreakdown?.zeroMatch ? formatPercentage(events.processingStatusBreakdown.zeroMatch.percentage) : '—'} />
          <MetricCard title="Duplicate Rate" value={events.processingStatusBreakdown?.duplicate ? formatPercentage(events.processingStatusBreakdown.duplicate.percentage) : '—'} />
        </div>
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
        {trends.isLoading ? <LoadingSpinner /> : trends.data ? (
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

          {activeTab === 'practitioner' && (
            <Card>
              {byPractitioner.isLoading ? <LoadingSpinner /> : byPractitioner.error ? <ErrorAlert error={byPractitioner.error} /> : byPractitioner.data ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                          <th className="pb-2 pr-4">Practitioner</th>
                          <th className="pb-2 pr-4">Display Name</th>
                          <th className="pb-2 pr-4">Facility</th>
                          <th className="pb-2">Total Events</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {byPractitioner.data.data.map((p) => (
                          <tr key={p.practitionerRef} className="hover:bg-gray-50">
                            <td className="py-2 pr-4 font-medium text-gray-900">{p.practitionerRef}</td>
                            <td className="py-2 pr-4 text-gray-600">{p.practitionerDisplay || '—'}</td>
                            <td className="py-2 pr-4 text-gray-600">{p.facilityId}</td>
                            <td className="py-2">{formatNumber(p.totalEvents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <CursorPagination
                    hasMore={byPractitioner.data.pagination.has_more}
                    nextCursor={byPractitioner.data.pagination.next_cursor}
                    onNext={(c) => { setPractCursor(c); setPractPage((p) => p + 1); }}
                    onReset={() => { setPractCursor(undefined); setPractPage(1); }}
                    currentPage={practPage}
                  />
                </>
              ) : null}
            </Card>
          )}

          {activeTab === 'source' && (
            <Card>
              {bySource.isLoading ? <LoadingSpinner /> : bySource.error ? <ErrorAlert error={bySource.error} /> : bySource.data ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                        <th className="pb-2 pr-4">Source</th>
                        <th className="pb-2 pr-4">Total Events</th>
                        <th className="pb-2">Resource Types</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bySource.data.map((s) => (
                        <tr key={s.source} className="hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium text-gray-900">{s.source}</td>
                          <td className="py-2 pr-4">{formatNumber(s.totalEvents)}</td>
                          <td className="py-2 text-gray-600">{s.byResourceType.map((r) => `${r.resourceType}: ${r.count}`).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Card>
          )}

          {activeTab === 'processing-quality' && (
            <Card>
              {quality.isLoading ? <LoadingSpinner /> : quality.error ? <ErrorAlert error={quality.error} /> : quality.data?.bySource?.length ? (
                <ProcessingQualityChart data={quality.data.bySource} />
              ) : quality.data ? (
                <p className="py-8 text-center text-sm text-gray-500">No processing quality data available</p>
              ) : null}
            </Card>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to="/events/source-comparison" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Compare Sources →
        </Link>
      </div>
    </>
  );
}
