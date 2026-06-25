import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { FacilityRankingCard } from '../components/facilities/FacilityRankingCard';
import { useFacilityActivitySummary } from '../hooks/useFacilities';
import { formatNumber } from '../utils/formatters';

export default function FacilityAnalytics() {
  const activitySummary = useFacilityActivitySummary();

  return (
    <>
      <PageHeader title="Facility Analytics" description="Facility leaderboard and compliance ranking" />

      {activitySummary.error && <ErrorAlert error={activitySummary.error} />}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Facilities"
          description="All in-scope healthcare facilities in the facility reference list."
          value={activitySummary.isLoading ? '…' : activitySummary.error ? '—' : formatNumber(activitySummary.data?.totalInScope ?? 0)}
        />
        <MetricCard
          title="Active Facilities"
          description="Facilities that transmitted at least one HIE event within the selected period."
          value={activitySummary.isLoading ? '…' : activitySummary.error ? '—' : formatNumber(activitySummary.data?.activeFacilities ?? 0)}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Inactive Facilities"
          description="In-scope facilities with no HIE events transmitted within the selected period."
          value={activitySummary.isLoading ? '…' : activitySummary.error ? '—' : formatNumber(activitySummary.data?.inactiveFacilities ?? 0)}
          bgColor="bg-red-50"
        />
      </div>

      <FacilityRankingCard />
    </>
  );
}
