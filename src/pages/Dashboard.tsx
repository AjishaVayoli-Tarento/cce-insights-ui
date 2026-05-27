import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { DeviationTrendChart } from '../components/charts/DeviationTrendChart';
import { EventTrendChart } from '../components/charts/EventTrendChart';
import { useEventSummary, useEventTrends } from '../hooks/useEventVolume';
import { useDeviationTrends, useIntelligenceSummary } from '../hooks/useDeviations';
import { usePipelineLoss } from '../hooks/useIngestion';
import { useAtRiskHotspots } from '../hooks/usePatients';
import { useDashboardOverview } from '../hooks/useDashboard';
import { formatNumber, formatPercentage } from '../utils/formatters';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  SignalIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const eventSummary = useEventSummary();
  const intelligence = useIntelligenceSummary();
  const deviationTrends = useDeviationTrends('daily');
  const eventTrends = useEventTrends('daily');
  const pipelineLoss = usePipelineLoss();
  const hotspots = useAtRiskHotspots({ limit: 10 });
  const overview = useDashboardOverview();

  const isLoading = eventSummary.isLoading || intelligence.isLoading;

  if (isLoading) return <LoadingSpinner />;

  const firstError = eventSummary.error || intelligence.error;
  if (firstError) return <ErrorAlert error={firstError} />;

  const events = eventSummary.data;
  const intel = intelligence.data;
  const loss = pipelineLoss.data;
  const dash = overview.data;

  const matchRate = events?.totalEvents
    ? ((events.processingStatusBreakdown?.matched?.count ?? 0) / events.totalEvents) * 100
    : 0;

  const atRiskTotal = hotspots.data?.data?.reduce(
    (sum, h) => sum + h.atRisk.count + h.nonCompliant.count,
    0,
  ) ?? 0;

  const facilityCount = dash?.activeFacilities ?? events?.byFacility?.length ?? 0;

  return (
    <>
      <PageHeader title="Dashboard" description="High-level operational metrics and trend snapshots" />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Events"
          value={events ? formatNumber(events.totalEvents) : '—'}
          icon={<ChartBarIcon className="h-5 w-5" />}
          linkTo="/events"
        />
        <MetricCard
          title="Active Deviations"
          value={intel ? formatNumber(intel.totalDeviations) : '—'}
          subtitle={intel ? `${intel.recentActivity.last24Hours} new in 24h` : undefined}
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          linkTo="/deviations"
        />
        <MetricCard
          title="Facilities Tracked"
          value={formatNumber(facilityCount)}
          icon={<BuildingOffice2Icon className="h-5 w-5" />}
          linkTo="/facilities"
        />
        <MetricCard
          title="Pipeline Loss Rate"
          value={loss ? formatPercentage(loss.lossRate) : '—'}
          subtitle={loss ? `${formatNumber(loss.lostEvents)} events lost` : undefined}
          icon={<SignalIcon className="h-5 w-5" />}
          linkTo="/ingestion"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Match Rate"
          value={events ? formatPercentage(matchRate) : '—'}
          subtitle="MATCHED events"
          linkTo="/events"
        />
        <MetricCard
          title="At-Risk Patients"
          value={formatNumber(atRiskTotal)}
          subtitle={hotspots.data?.data ? `across ${hotspots.data.data.length} facilities` : undefined}
          icon={<UserGroupIcon className="h-5 w-5" />}
          linkTo="/compliance/patients"
        />
      </div>

      {/* Top & Bottom Facilities */}
      {dash && (dash.topFacilities?.length > 0 || dash.bottomFacilities?.length > 0) && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Top 3 Facilities" subtitle="by compliance rate">
            <div className="space-y-3">
              {dash.topFacilities?.map((f, i) => (
                <FacilityRow key={f.facilityId} facility={f} index={i} variant="top" />
              ))}
              {(!dash.topFacilities || dash.topFacilities.length === 0) && (
                <p className="py-4 text-center text-sm text-gray-500">No facility data available</p>
              )}
            </div>
          </Card>
          <Card title="Bottom 3 Facilities" subtitle="by compliance rate">
            <div className="space-y-3">
              {dash.bottomFacilities?.map((f, i) => (
                <FacilityRow key={f.facilityId} facility={f} index={i} variant="bottom" />
              ))}
              {(!dash.bottomFacilities || dash.bottomFacilities.length === 0) && (
                <p className="py-4 text-center text-sm text-gray-500">No facility data available</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Trend Charts */}
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
    </>
  );
}

function FacilityRow({ facility, index, variant }: {
  facility: { facilityId: string; facilityName?: string; complianceRate: number; activeDeviations: number; totalEvents: number; totalEnrollments: number };
  index: number;
  variant: 'top' | 'bottom';
}) {
  const Icon = variant === 'top' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const accentColor = variant === 'top' ? 'text-green-600' : 'text-red-600';
  const badgeBg = variant === 'top' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700';

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${badgeBg}`}>
          {index + 1}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800">{facility.facilityName || facility.facilityId}</p>
          <p className="text-xs text-gray-500">{formatNumber(facility.totalEvents)} events · {formatNumber(facility.activeDeviations)} deviations</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="text-center">
          <p className="text-gray-500">Enrollments</p>
          <p className="font-semibold text-gray-700">{formatNumber(facility.totalEnrollments)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Events</p>
          <p className="font-semibold text-gray-700">{formatNumber(facility.totalEvents)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Compliance</p>
          <div className="flex items-center justify-center gap-1">
            <Icon className={`h-4 w-4 ${accentColor}`} />
            <span className={`font-semibold ${accentColor}`}>
              {formatPercentage(facility.complianceRate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
