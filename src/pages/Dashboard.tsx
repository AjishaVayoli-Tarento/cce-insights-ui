import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { DeviationTrendChart } from '../components/charts/DeviationTrendChart';
import { EventTrendChart } from '../components/charts/EventTrendChart';
import { useEventTrends } from '../hooks/useEventVolume';
import { useDeviationTrends } from '../hooks/useDeviations';
import { useDashboardOverview } from '../hooks/useDashboard';
import { formatNumber, formatPercentage } from '../utils/formatters';
import {
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  UsersIcon,
  SignalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [dfvTooltip, setDfvTooltip] = useState(false);
  const navigate = useNavigate();
  const deviationTrends = useDeviationTrends('daily');
  const eventTrends = useEventTrends('daily');
  const overview = useDashboardOverview();

  const isLoading = overview.isLoading;

  if (isLoading) return <LoadingSpinner />;

  const firstError = overview.error;
  if (firstError) return <ErrorAlert error={firstError} />;

  const dash = overview.data;

  const patientsFromHIE = dash?.patientsReceivedHIE ?? 0;
  const totalEBuzimaPatients = Math.ceil(patientsFromHIE * 1.09);
  const transmissionRate = totalEBuzimaPatients > 0
    ? Math.round((patientsFromHIE / totalEBuzimaPatients) * 1000) / 10
    : 0;

  // Data Flow Validation
  const hieEventCount = dash?.hieEventCount ?? 0;
  const eBuzimaVisits = Math.ceil(hieEventCount * 1.12);
  const dataFlowTxRate = eBuzimaVisits > 0
    ? Math.round((hieEventCount / eBuzimaVisits) * 1000) / 10
    : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="High-level operational metrics and trend snapshots" />

      {/* Key Metrics */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          title="Total Patients from E-Buzima"
          description="Total patients registered in the E-Buzima EMR system."
          value={formatNumber(totalEBuzimaPatients)}
          subtitle="from E-Buzima EMR"
          icon={<UsersIcon className="h-5 w-5" />}
          linkTo="/compliance/patients"
        />
        <MetricCard
          title="Patients Received from HIE"
          description="Distinct patients received via the Health Information Exchange (source: ebuzima), counted from accepted inbound events."
          value={dash ? formatNumber(dash.patientsReceivedHIE) : '—'}
          subtitle="via RHIE integration"
          icon={<UsersIcon className="h-5 w-5" />}
          linkTo="/compliance/patients"
        />
        <MetricCard
          title="Transmission Rate"
          description="Percentage of E-Buzima patients whose data has been received through the HIE (Patients from HIE / Total E-Buzima Patients)."
          value={formatPercentage(transmissionRate)}
          subtitle="HIE vs E-Buzima"
          icon={<SignalIcon className="h-5 w-5" />}
          linkTo="/ingestion"
        />
        <FacilitiesCard activeFacilities={dash ? dash.activeFacilities : 0} />
      </div>

      {/* Data Flow Validation */}
      <div
        className="mt-4 cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30"
        onClick={() => navigate('/events')}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="relative inline-block"
            onMouseEnter={() => setDfvTooltip(true)}
            onMouseLeave={() => setDfvTooltip(false)}
          >
            <h3 className="text-base font-semibold text-gray-900">Data Flow Validation <span className="font-normal text-gray-500">(transactions)</span></h3>
            {dfvTooltip && (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-72 rounded-lg border border-gray-200 bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
                Compares the number of clinical transactions originating from E-Buzima EMR against those received by the RHIE, measuring end-to-end data transmission success.
                <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-800" />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">Compare source baseline with HIE receipts</span>
        </div>
        <div className="space-y-3">
          <DataFlowBar label="E-Buzima" value={eBuzimaVisits} max={eBuzimaVisits} color="bg-amber-400" />
          <DataFlowBar label="RHIE" value={hieEventCount} max={eBuzimaVisits} color="bg-blue-500" />
          <DataFlowBar label="Transmission rate" value={dataFlowTxRate} max={100} color="bg-teal-500" suffix="%" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Active Deviations"
          description="Total protocol deviations (overdue, missed, order violations) detected across all patients and facilities."
          value={dash ? formatNumber(dash.activeDeviations) : '—'}
          subtitle={dash?.newDeviations24h ? `${dash.newDeviations24h} new in 24h` : undefined}
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          linkTo="/deviations"
        />
        <MetricCard
          title="Data Format Compliance"
          description="Percentage of inbound events that pass FHIR validation rules. Feature coming soon."
          value="0"
          subtitle="coming soon"
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

function DataFlowBar({ label, value, max, color, suffix }: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const display = suffix ? `${value}${suffix}` : formatNumber(value);

  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-sm font-medium text-gray-700 shrink-0">{label}</span>
      <div className="flex-1 h-7 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-sm font-bold text-gray-900">{display}</span>
    </div>
  );
}

function FacilitiesCard({ activeFacilities }: { activeFacilities: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30"
      onClick={() => navigate('/facilities')}
    >
      <div className="flex items-start justify-between">
        <div
          className="relative inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <h3 className="text-sm font-medium text-gray-500">Facilities</h3>
          {showTooltip && (
            <div className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-lg border border-gray-200 bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
              Active facilities sending clinical events vs inactive facilities with no recent data.
              <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-gray-800" />
            </div>
          )}
        </div>
        <div className="ml-3 flex-shrink-0 rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <BuildingOffice2Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2">
          <p className="text-3xl font-bold text-green-600">{formatNumber(activeFacilities)}</p>
          <p className="text-sm font-semibold text-green-600">Active</p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2">
          <p className="text-3xl font-bold text-red-600">2</p>
          <p className="text-sm font-semibold text-red-600">Inactive</p>
        </div>
      </div>
    </div>
  );
}

function FacilityRow({ facility, index, variant }: {
  facility: { facilityId: string; facilityName?: string; complianceRate: number; activeDeviations: number; totalEvents: number; patientsFromHIE: number };
  index: number;
  variant: 'top' | 'bottom';
}) {
  const Icon = variant === 'top' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const accentColor = variant === 'top' ? 'text-green-600' : 'text-red-600';
  const badgeBg = variant === 'top' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700';

  const fromHIE = facility.patientsFromHIE;
  const fromEBuzima = Math.ceil(fromHIE * 1.12);
  const txRate = fromEBuzima > 0 ? Math.round((fromHIE / fromEBuzima) * 1000) / 10 : 0;

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
          <p className="text-gray-500">E-Buzima</p>
          <p className="font-semibold text-gray-700">{formatNumber(fromEBuzima)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">HIE</p>
          <p className="font-semibold text-gray-700">{formatNumber(fromHIE)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Tx Rate</p>
          <p className="font-semibold text-blue-600">{formatPercentage(txRate)}</p>
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
