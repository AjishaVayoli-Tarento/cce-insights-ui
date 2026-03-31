import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { ResourceTypeBarChart } from '../components/charts/ResourceTypeBarChart';
import { useSourceComparison } from '../hooks/useSourceComparison';
import { useEventsBySource } from '../hooks/useEventVolume';
import { formatNumber, formatPercentage } from '../utils/formatters';

export default function SourceComparison() {
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');
  const [windowSeconds, setWindowSeconds] = useState(300);
  const [submitted, setSubmitted] = useState(false);

  const sources = useEventsBySource();
  const comparison = useSourceComparison({
    sourceA: submitted ? sourceA : '',
    sourceB: submitted ? sourceB : '',
    windowSeconds,
  });

  const data = comparison.data;

  const handleCompare = () => {
    if (sourceA && sourceB) setSubmitted(true);
  };

  return (
    <>
      <div className="mb-2">
        <Link to="/events" className="text-sm text-blue-600 hover:text-blue-700">← Back to Event Volume</Link>
      </div>
      <PageHeader title="Source Comparison" description="Compare two source systems for event overlap and unique events" />

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Source A</label>
            <select
              value={sourceA}
              onChange={(e) => { setSourceA(e.target.value); setSubmitted(false); }}
              className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select source...</option>
              {sources.data?.map((s) => (
                <option key={s.source} value={s.source}>{s.source}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Source B</label>
            <select
              value={sourceB}
              onChange={(e) => { setSourceB(e.target.value); setSubmitted(false); }}
              className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select source...</option>
              {sources.data?.map((s) => (
                <option key={s.source} value={s.source}>{s.source}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Match Window (seconds)</label>
            <input
              type="number"
              value={windowSeconds}
              onChange={(e) => setWindowSeconds(Number(e.target.value))}
              className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCompare}
            disabled={!sourceA || !sourceB}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Compare
          </button>
        </div>
      </Card>

      {comparison.isLoading && <LoadingSpinner />}
      {comparison.error && <ErrorAlert error={comparison.error} />}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-gray-700">Source A: {data.sourceA}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(data.sourceASummary.totalEvents)}</p>
              <p className="text-sm text-gray-500">Unique: {formatNumber(data.sourceASummary.uniqueEvents)}</p>
              <p className="text-sm text-gray-500">Overlap: {formatPercentage(data.sourceASummary.overlapPercentage)}</p>
            </Card>
            <Card>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700">Overlap</h3>
                <p className="mt-2 text-2xl font-bold text-blue-600">{formatNumber(data.overlap.totalOverlappingEvents)}</p>
                <p className="text-sm text-gray-500">events</p>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-gray-700">Source B: {data.sourceB}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(data.sourceBSummary.totalEvents)}</p>
              <p className="text-sm text-gray-500">Unique: {formatNumber(data.sourceBSummary.uniqueEvents)}</p>
              <p className="text-sm text-gray-500">Overlap: {formatPercentage(data.sourceBSummary.overlapPercentage)}</p>
            </Card>
          </div>

          {data.overlap.byResourceType.length > 0 && (
            <Card title="Overlap by Resource Type" className="mt-6">
              <ResourceTypeBarChart
                data={data.overlap.byResourceType.map((r) => ({
                  resourceType: r.resourceType,
                  count: r.count,
                  percentage: (r.count / data.overlap.totalOverlappingEvents) * 100,
                }))}
              />
            </Card>
          )}

          {data.samples.length > 0 && (
            <Card title="Sample Pairs" className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                      <th className="pb-2 pr-4">Patient</th>
                      <th className="pb-2 pr-4">Resource Type</th>
                      <th className="pb-2 pr-4">Time A</th>
                      <th className="pb-2 pr-4">Time B</th>
                      <th className="pb-2">Diff (s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.samples.map((s) => (
                      <tr key={`${s.eventAId}-${s.eventBId}`} className="hover:bg-gray-50">
                        <td className="py-2 pr-4 text-gray-900">{s.subject}</td>
                        <td className="py-2 pr-4">{s.resourceType}</td>
                        <td className="py-2 pr-4 text-gray-600">{new Date(s.eventTimeA).toLocaleString()}</td>
                        <td className="py-2 pr-4 text-gray-600">{new Date(s.eventTimeB).toLocaleString()}</td>
                        <td className="py-2">{s.timeDiffSeconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
