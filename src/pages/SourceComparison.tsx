import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { useSourceComparison } from '../hooks/useSourceComparison';
import { useEventTrendsBySource } from '../hooks/useEventVolume';
import { useSourcesLookup } from '../hooks/useLookups';
import { SourceTimelineChart } from '../components/charts/SourceTimelineChart';
import { formatNumber, formatPercentage } from '../utils/formatters';

export default function SourceComparison() {
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');
  const [windowSeconds, setWindowSeconds] = useState(300);
  const [submitted, setSubmitted] = useState(false);

  const sources = useSourcesLookup();
  const comparison = useSourceComparison({
    sourceA: submitted ? sourceA : '',
    sourceB: submitted ? sourceB : '',
    windowSeconds,
  });

  const trendsA = useEventTrendsBySource(submitted ? sourceA : '');
  const trendsB = useEventTrendsBySource(submitted ? sourceB : '');

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
              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select source...</option>
              {sources.data?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Source B</label>
            <select
              value={sourceB}
              onChange={(e) => { setSourceB(e.target.value); setSubmitted(false); }}
              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select source...</option>
              {sources.data?.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500" title="Max time difference (seconds) to consider two events from different sources as the same event">Match Window (seconds)</label>
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

          {trendsA.data && trendsB.data && (
            <Card title="Event Timeline by Source" className="mt-6">
              <p className="mb-4 text-sm text-gray-500">
                Daily event volume for each source — gaps between lines indicate missed or delayed events.
              </p>
              <SourceTimelineChart
                sourceA={data.sourceA}
                sourceB={data.sourceB}
                trendsA={trendsA.data.trends}
                trendsB={trendsB.data.trends}
              />
            </Card>
          )}


        </>
      )}
    </>
  );
}
