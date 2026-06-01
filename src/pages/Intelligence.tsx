import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { useIntelligenceSummary } from '../hooks/useIntelligence';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#22c55e',
  FAILED: '#ef4444',
  PENDING: '#f59e0b',
  EXECUTING: '#3b82f6',
  CANCELLED: '#6b7280',
};

export default function Intelligence() {
  const { data, isLoading, error } = useIntelligenceSummary();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return null;

  const donutData = data.byStatus.map((s) => ({ name: s.label, value: s.count }));

  return (
    <>
      <PageHeader title="Intelligence" description="Delivery analytics — success rates, destinations, active adaptors" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard title="Total Deliveries" value={formatNumber(data.total)} description="Total number of intelligence delivery attempts (alerts, notifications, recommendations) sent to external systems." />
        <MetricCard title="Delivered" value={formatNumber(data.delivered)} description="Deliveries that were successfully received and acknowledged by the target system." />
        <MetricCard title="Failed" value={formatNumber(data.failed)} description="Deliveries that failed due to target system errors, timeouts, or connectivity issues." />
        <MetricCard title="Pending" value={formatNumber(data.pending)} description="Deliveries currently queued or in-progress, awaiting confirmation from the target system." />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard title="Success Rate" value={formatPercentage(data.successRate)} description="Percentage of deliveries that were successfully delivered out of all attempted deliveries." />
        <MetricCard title="Avg Latency" value={data.avgLatencySeconds != null ? `${data.avgLatencySeconds.toFixed(1)}s` : '—'} description="Average time from delivery initiation to successful acknowledgement by the target system." />
      </div>

      {/* Donut Chart */}
      <Card title="Success / Failure Rate" className="mt-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Deliveries by Destination */}
        <Card title="Deliveries by Destination">
          <div className="space-y-2">
            {data.byDestination.map((d) => (
              <div key={d.destination} className="flex items-center gap-3">
                <span className="w-48 truncate text-sm text-gray-700">{d.destination}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${data.total > 0 ? (d.count / data.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="w-12 text-right text-xs text-gray-500">{formatNumber(d.count)}</span>
              </div>
            ))}
            {data.byDestination.length === 0 && <p className="text-sm text-gray-400">No data</p>}
          </div>
        </Card>

        {/* Active Adaptors */}
        <Card title="Active Adaptors & Routing">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 font-medium">Adaptor</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Destinations</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.activeAdaptors.map((a) => (
                  <tr key={a.name}>
                    <td className="py-2 font-medium text-gray-900">{a.name}</td>
                    <td className="py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{a.destinations.join(', ') || '—'}</td>
                  </tr>
                ))}
                {data.activeAdaptors.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-gray-400">No adaptors configured</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
