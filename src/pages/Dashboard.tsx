import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { DeviationTrendChart } from '../components/charts/DeviationTrendChart';
import { EventTrendChart } from '../components/charts/EventTrendChart';
import { useEventSummary, useEventTrends } from '../hooks/useEventVolume';
import { useIntelligenceSummary, useDeviationTrends } from '../hooks/useDeviations';
import { usePipelineLoss } from '../hooks/useIngestion';
import { useAtRiskHotspots } from '../hooks/usePatients';
import { formatNumber, formatPercentage } from '../utils/formatters';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  SignalIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const eventSummary = useEventSummary();
  const intelligence = useIntelligenceSummary();
  const deviationTrends = useDeviationTrends('daily');
  const eventTrends = useEventTrends('daily');
  const pipelineLoss = usePipelineLoss();
  const hotspots = useAtRiskHotspots({ limit: 10 });

  const isLoading = eventSummary.isLoading || intelligence.isLoading;

  if (isLoading) return <LoadingSpinner />;

  const firstError = eventSummary.error || intelligence.error;
  if (firstError) return <ErrorAlert error={firstError} />;

  const events = eventSummary.data;
  const intel = intelligence.data;
  const loss = pipelineLoss.data;

  const matchRate = events?.processingStatusBreakdown?.matched
    ? events.processingStatusBreakdown.matched.percentage
    : 0;

  const atRiskTotal = hotspots.data?.data?.reduce(
    (sum, h) => sum + h.atRisk.count + h.nonCompliant.count,
    0,
  ) ?? 0;

  const facilityCount = events?.byFacility?.length ?? 0;

  return (
    <>
      <PageHeader title="Dashboard" description="High-level operational metrics and trend snapshots" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Events"
          value={events ? formatNumber(events.totalEvents) : '—'}
          icon={<ChartBarIcon className="h-5 w-5" />}
        />
        <MetricCard
          title="Active Deviations"
          value={intel ? formatNumber(intel.totalDeviations) : '—'}
          subtitle={intel?.recentActivity ? `${intel.recentActivity.last24Hours} new in 24h` : undefined}
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
        />
        <MetricCard
          title="Facilities Tracked"
          value={facilityCount}
          icon={<BuildingOffice2Icon className="h-5 w-5" />}
        />
        <MetricCard
          title="Pipeline Loss Rate"
          value={loss ? formatPercentage(loss.lossRate) : '—'}
          subtitle={loss ? `${formatNumber(loss.lostEvents)} events lost` : undefined}
          icon={<SignalIcon className="h-5 w-5" />}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Match Rate"
          value={events ? formatPercentage(matchRate) : '—'}
          subtitle="MATCHED events"
        />
        <MetricCard
          title="At-Risk Patients"
          value={formatNumber(atRiskTotal)}
          subtitle={hotspots.data?.data ? `across ${hotspots.data.data.length} facilities` : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Deviation Trends (30 days)">
          {deviationTrends.isLoading ? (
            <LoadingSpinner />
          ) : deviationTrends.data ? (
            <DeviationTrendChart data={deviationTrends.data.trends} height={240} />
          ) : null}
        </Card>
        <Card title="Event Volume (30 days)">
          {eventTrends.isLoading ? (
            <LoadingSpinner />
          ) : eventTrends.data ? (
            <EventTrendChart data={eventTrends.data.trends} height={240} />
          ) : null}
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Navigation</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/compliance', label: 'Compliance Overview' },
            { to: '/facilities', label: 'Facility Rankings' },
            { to: '/ingestion', label: 'Ingestion Health' },
            { to: '/exports', label: 'Export Data' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              {label}
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
