import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { StatusBadge } from '../components/shared/StatusBadge';
import { usePatientTimeline, usePatientProtocolTracking, usePatientProtocolTrackingDetail, usePatientEvents, usePatientDeviations } from '../hooks/usePatients';
import { formatDate, formatDateTime } from '../utils/dates';
import { formatPercentage } from '../utils/formatters';
import { STATUS_COLORS, STATE_COLORS, PROCESSING_COLORS } from '../utils/colors';
import type { ProtocolInstanceStatus, StepState, ProcessingStatus } from '../api/types';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = id ?? '';
  const [selectedProtocol, setSelectedProtocol] = useState('');

  const tracking = usePatientProtocolTracking(patientId);
  const timeline = usePatientTimeline(patientId);
  const events = usePatientEvents(patientId, { limit: 50 });
  const deviations = usePatientDeviations(patientId);
  const detail = usePatientProtocolTrackingDetail(patientId, selectedProtocol);

  return (
    <>
      <div className="mb-2">
        <Link to="/compliance/patients" className="text-sm text-blue-600 hover:text-blue-700">← Back to Patient List</Link>
      </div>
      <PageHeader title={`Patient: ${patientId}`} />

      <Card title="Protocol Enrollments">
        {tracking.isLoading && <LoadingSpinner />}
        {tracking.error && <ErrorAlert error={tracking.error} />}
        {tracking.data && tracking.data.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No protocol enrollments found.</p>
        )}
        {tracking.data && (
          <div className="space-y-3">
            {tracking.data.map((p) => (
              <div key={p.protocolInstanceId} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={p.status.toUpperCase()}
                        color={STATUS_COLORS[p.status as ProtocolInstanceStatus]}
                      />
                      <span className="text-sm font-semibold text-gray-900">{p.protocolCanonical}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enrolled: {formatDate(p.enrolledAt)} · Rate: {formatPercentage(p.complianceRate)} · Steps: {p.stepsCompleted}/{p.totalSteps}
                    </p>
                    <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(p.stepsCompleted / Math.max(p.totalSteps, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProtocol(p.protocolInstanceId)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedProtocol && detail.data && (
        <Card title={`Step Details — ${detail.data.protocolCanonical}`} className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-4">Action</th>
                  <th className="pb-2 pr-4">State</th>
                  <th className="pb-2 pr-4">Due Date</th>
                  <th className="pb-2 pr-4">Completed</th>
                  <th className="pb-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detail.data.steps.map((s) => (
                  <tr key={s.stepInstanceId} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900">{s.actionId}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge label={s.state} color={STATE_COLORS[s.state as StepState]} />
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{s.dueDate ? formatDate(s.dueDate) : '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{s.completedAt ? formatDateTime(s.completedAt) : '—'}</td>
                    <td className="py-2 text-gray-600">{s.completedBySource || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Compliance Timeline">
          {timeline.isLoading ? <LoadingSpinner /> : timeline.error ? <ErrorAlert error={timeline.error} /> : timeline.data ? (
            <div className="space-y-0">
              {timeline.data.protocols.flatMap((proto) =>
                proto.timeline.map((entry, i) => (
                  <div key={`${proto.protocolInstanceId}-${i}`} className="flex gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      {i < proto.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                    </div>
                    <div className="min-w-0 pb-2">
                      <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                      <p className="text-sm text-gray-700">
                        {entry.type === 'enrollment' ? `Enrolled in ${proto.protocolCanonical}` : entry.description || entry.type}
                      </p>
                      {entry.completionStatus && (
                        <span className="text-xs text-gray-500">{entry.completionStatus}</span>
                      )}
                      {entry.source && (
                        <span className="ml-2 text-xs text-gray-400">Source: {entry.source}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </Card>

        <Card title="Deviations">
          {deviations.isLoading ? <LoadingSpinner /> : deviations.error ? <ErrorAlert error={deviations.error} /> : deviations.data && deviations.data.length > 0 ? (
            <div className="space-y-3">
              {deviations.data.map((d) => (
                <div key={d.deviationId} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${d.deviationType === 'OVERDUE' ? 'text-amber-600' : 'text-red-600'}`}>
                      {d.deviationType === 'OVERDUE' ? '⚠' : '🔴'} {d.deviationType}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{d.protocolCanonical}</p>
                  <p className="text-xs text-gray-500">Detected: {formatDate(d.detectedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">No deviations found.</p>
          )}
        </Card>
      </div>

      <Card title="Event History" className="mt-6">
        {events.isLoading ? <LoadingSpinner /> : events.error ? <ErrorAlert error={events.error} /> : events.data && events.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-4">Time</th>
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Action</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.data.map((e) => (
                  <tr key={e.eventId} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-600">{formatDateTime(e.eventTime)}</td>
                    <td className="py-2 pr-4 text-gray-600">{e.source}</td>
                    <td className="py-2 pr-4">{e.resourceType}</td>
                    <td className="py-2 pr-4 text-gray-600">{e.actionId || '—'}</td>
                    <td className="py-2">
                      <StatusBadge
                        label={e.processingStatus}
                        color={PROCESSING_COLORS[e.processingStatus as ProcessingStatus]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">No events found.</p>
        )}
      </Card>
    </>
  );
}
