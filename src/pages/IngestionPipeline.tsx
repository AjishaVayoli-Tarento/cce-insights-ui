import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { IngestionFunnelChart } from '../components/charts/IngestionFunnelChart';
import { useIngestionFunnel, useIngestionRejections, useSourceQuality, usePipelineLoss } from '../hooks/useIngestion';
import { formatNumber, formatPercentage } from '../utils/formatters';

export default function IngestionPipeline() {
  const funnel = useIngestionFunnel();
  const rejections = useIngestionRejections();
  const quality = useSourceQuality();
  const loss = usePipelineLoss();

  return (
    <>
      <PageHeader title="Ingestion Pipeline" description="Ingestion health — acceptance/rejection funnel, rejection reasons, source quality, pipeline loss" />

      {funnel.isLoading ? <LoadingSpinner /> : funnel.error ? <ErrorAlert error={funnel.error} /> : funnel.data ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard title="Received" value={formatNumber(funnel.data.totalReceived)} />
            <MetricCard title="Accepted" value={formatPercentage(funnel.data.acceptanceRate)} subtitle={formatNumber(funnel.data.accepted)} />
            <MetricCard title="Rejected" value={formatPercentage(funnel.data.rejectionRate)} subtitle={formatNumber(funnel.data.rejected)} />
            <MetricCard
              title="Pipeline Loss"
              value={loss.data ? formatPercentage(loss.data.lossRate) : '—'}
              subtitle={loss.data ? `${formatNumber(loss.data.lostEvents)} events` : undefined}
            />
          </div>

          <Card title="Ingestion Funnel" className="mt-6">
            <IngestionFunnelChart data={funnel.data.breakdown} />
          </Card>
        </>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Rejection Reasons">
          {rejections.isLoading ? <LoadingSpinner /> : rejections.error ? <ErrorAlert error={rejections.error} /> : rejections.data ? (
            <div className="space-y-2">
              {rejections.data.byReason.map((r) => (
                <div key={r.reason} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm text-gray-700">{r.reason}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${r.percentage}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right text-xs text-gray-500">{formatPercentage(r.percentage)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card title="Source Quality">
          {quality.isLoading ? <LoadingSpinner /> : quality.error ? <ErrorAlert error={quality.error} /> : quality.data ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="pb-2 pr-4">Source</th>
                    <th className="pb-2 pr-4">Accept</th>
                    <th className="pb-2">Reject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quality.data.sources.map((s) => (
                    <tr key={s.source} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{s.source}</td>
                      <td className="py-2 pr-4 text-green-600">{formatPercentage(s.acceptanceRate)}</td>
                      <td className="py-2 text-red-600">{formatPercentage(s.rejectionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>

      {loss.data && loss.data.lostEvents > 0 && (
        <Card className="mt-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg">⚠</span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formatNumber(loss.data.lostEvents)} events accepted by Collector but not found in Compliance event_log
              </p>
              <p className="text-xs text-gray-500">
                Loss rate: {formatPercentage(loss.data.lossRate)}
              </p>
              {loss.data.bySource && (
                <p className="mt-1 text-xs text-gray-500">
                  Lost by Source: {loss.data.bySource.map((s: { source: string; lostEvents: number }) => `${s.source}: ${s.lostEvents}`).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
