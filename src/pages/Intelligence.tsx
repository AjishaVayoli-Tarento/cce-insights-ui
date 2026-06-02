import { useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { ProtocolFilter } from '../components/shared/ProtocolFilter';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { useIntelligenceSummary } from '../hooks/useIntelligence';
import { useActionOrder } from '../hooks/useProtocols';
import { formatNumber } from '../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#22c55e',
  FAILED: '#ef4444',
  PENDING: '#f59e0b',
  EXECUTING: '#3b82f6',
  CANCELLED: '#6b7280',
};

export default function Intelligence() {
  const [protocolId, setProtocolId] = useState('');
  const { data, isLoading, error } = useIntelligenceSummary();
  const actionOrder = useActionOrder(protocolId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!data) return null;

  const donutData = data.byStatus.map((s) => ({ name: s.label, value: s.count }));

  return (
    <>
      <PageHeader title="Intelligence" description="Delivery analytics — success rates, destinations, active adaptors" />

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-500">Protocol</label>
        <ProtocolFilter value={protocolId} onChange={setProtocolId} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard title="Total Action Instances" value={formatNumber(data.total)} description="Total number of intelligence delivery attempts (alerts, notifications, recommendations) sent to external systems." />
        <MetricCard title="Delivered" value={formatNumber(data.delivered)} description="Deliveries that were successfully received and acknowledged by the target system." />
        <MetricCard title="Failed" value={formatNumber(data.failed)} description="Deliveries that failed due to target system errors, timeouts, or connectivity issues." />
        <MetricCard title="Pending" value={formatNumber(data.pending)} description="Deliveries currently queued or in-progress, awaiting confirmation from the target system." />
      </div>

      {/* Three sections in a single row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Success / Failure Rate */}
        <Card title="Success / Failure Rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
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

        {/* Deliveries by Destination */}
        <Card title="Deliveries by Destination">
          <div className="space-y-2">
            {data.byDestination.map((d) => (
              <div key={d.destination} className="flex items-center gap-3">
                <span className="w-36 truncate text-sm text-gray-700">{d.destination}</span>
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

      {/* Intelligence Actions */}
      <Card title="Intelligence Actions" className="mt-6">
        {!protocolId ? (
          <p className="py-4 text-center text-sm text-gray-400">Select a protocol to view intelligence actions.</p>
        ) : actionOrder.isLoading ? (
          <LoadingSpinner />
        ) : actionOrder.error ? (
          <ErrorAlert error={actionOrder.error} />
        ) : actionOrder.data && actionOrder.data.filter((a) => a.type === 'fire-event').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Action</th>
                  <th className="pb-2 pr-4">Trigger</th>
                  <th className="pb-2">Parent Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actionOrder.data.filter((a) => a.type === 'fire-event').map((action, idx) => (
                  <tr key={action.actionId} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400">{idx + 1}</td>
                    <td className="py-2 pr-4 font-medium text-gray-900">{action.title || action.actionId}</td>
                    <td className="py-2 pr-4 text-gray-600">{action.actionId}</td>
                    <td className="py-2 text-gray-600">{action.parentActionId ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">No intelligence actions defined for this protocol.</p>
        )}
      </Card>
    </>
  );
}
