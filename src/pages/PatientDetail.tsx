import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card } from '../components/shared/Card';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { StatusBadge } from '../components/shared/StatusBadge';
import { usePatientTimeline, usePatientProtocolTracking, usePatientProtocolTrackingDetail, usePatientEvents, usePatientDeviations } from '../hooks/usePatients';
import { formatDate, formatDateTime } from '../utils/dates';
import { formatPercentage } from '../utils/formatters';
import { STATUS_COLORS, STATE_COLORS, PROCESSING_COLORS, COMPLETION_COLORS } from '../utils/colors';
import type { ProtocolInstanceStatus, StepState, ProcessingStatus, CompletionStatus, JourneyStep } from '../api/types';

type JourneyDisplayStatus = JourneyStep['status'] | 'DEVIATION';

const JOURNEY_STATUS: Record<JourneyDisplayStatus, { bg: string; text: string; dot: string; label: string }> = {
  COMPLETED:   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completed' },
  PENDING:     { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Pending' },
  DUE:         { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Due' },
  OVERDUE:     { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Overdue' },
  MISSED:      { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Missed' },
  SKIPPED:     { bg: 'bg-gray-50',   text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'Skipped' },
  NOT_STARTED: { bg: 'bg-gray-50',   text: 'text-gray-400',   dot: 'bg-gray-300',   label: 'Not Started' },
  DEVIATION:   { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Deviation' },
};

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = id ?? '';
  const [selectedProtocol, setSelectedProtocol] = useState('');

  const tracking = usePatientProtocolTracking(patientId);
  const timeline = usePatientTimeline(patientId);
  const events = usePatientEvents(patientId, { limit: 50 });
  const deviations = usePatientDeviations(patientId);
  const detail = usePatientProtocolTrackingDetail(patientId, selectedProtocol);

  // Build set of actionIds that have deviations (incomplete prerequisites from ORDER_VIOLATION)
  const deviationActionIds = useMemo(() => {
    const ids = new Set<string>();
    if (deviations.data) {
      for (const d of deviations.data) {
        if (d.deviationType === 'ORDER_VIOLATION' && d.metadata?.incompletePrerequisites) {
          d.metadata.incompletePrerequisites.forEach(id => ids.add(id));
        }
        if ((d.deviationType === 'OVERDUE' || d.deviationType === 'MISSED') && d.actionId) {
          ids.add(d.actionId);
        }
      }
    }
    return ids;
  }, [deviations.data]);

  return (
    <>
      <div className="mb-2">
        <Link to="/compliance/patients" className="text-sm text-blue-600 hover:text-blue-700">← Back to Patient List</Link>
      </div>
      <PageHeader title={`Patient: ${patientId}`} />

      <Card title="Protocol Tracking">
        {tracking.isLoading && <LoadingSpinner />}
        {tracking.error && <ErrorAlert error={tracking.error} />}
        {tracking.data && tracking.data.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No protocol tracking found.</p>
        )}
        {tracking.data && (
          <div className="space-y-3">
            {tracking.data.map((p) => (
              <div key={p.protocolInstanceId} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={p.status}
                        color={STATUS_COLORS[p.status as ProtocolInstanceStatus] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                      />
                      <span className="text-sm font-semibold text-gray-900">{p.protocolCanonical}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Tracking Since: {formatDate(p.enrolledAt)} · Rate: {formatPercentage(p.complianceRate)} · Steps: {p.stepsCompleted}/{p.totalSteps}
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
                      <StatusBadge label={s.state} color={STATE_COLORS[s.state as StepState] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }} />
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

      {timeline.data && timeline.data.protocols.length > 0 && (
        <Card title="Protocol Journey" className="mt-6">
          <div className="space-y-6">
            {timeline.data.protocols.map((proto) => (
              <div key={`journey-${proto.protocolInstanceId}`}>
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge
                    label={proto.status}
                    color={STATUS_COLORS[proto.status as ProtocolInstanceStatus] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                  />
                  <span className="text-xs font-medium text-gray-600 truncate">{proto.protocolCanonical}</span>
                </div>

                {/* Legend */}
                <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-600">Deviation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 bg-white" />
                    <span className="text-xs text-gray-600">Not started</span>
                  </div>
                  <div className="ml-2 border-l border-gray-300 pl-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-300 bg-amber-50">mandatory</span>
                      <span className="text-xs text-gray-500">always tracked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-inset ring-gray-400 bg-white">policy</span>
                      <span className="text-xs text-gray-500">policy-defined</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-0">
                  {(proto.journey ?? []).map((step, i, arr) => {
                    const hasDeviation = deviationActionIds.has(step.actionId);
                    const displayStatus: JourneyDisplayStatus = hasDeviation && step.status !== 'COMPLETED' && step.status !== 'SKIPPED'
                      ? 'DEVIATION'
                      : step.status;
                    const info = JOURNEY_STATUS[displayStatus] ?? JOURNEY_STATUS.NOT_STARTED;
                    const depth = step.depth ?? 0;
                    const isSubStep = depth > 0;
                    const isDeviation = displayStatus === 'DEVIATION';
                    const isNotStarted = displayStatus === 'NOT_STARTED';

                    return (
                      <div
                        key={`${proto.protocolInstanceId}-j-${i}`}
                        className={`flex gap-3 py-2.5 ${isDeviation ? 'mx-[-12px] px-3 rounded-lg bg-red-50 border border-red-200' : ''}`}
                        style={{ paddingLeft: isDeviation ? undefined : `${depth * 24}px` }}
                      >
                        <div className="flex flex-col items-center">
                          {isNotStarted ? (
                            <div className="mt-1 h-3.5 w-3.5 rounded-full border-2 border-gray-300 bg-white" />
                          ) : (
                            <div className={`mt-1 ${isSubStep ? 'h-3 w-3' : 'h-3.5 w-3.5'} rounded-full ${info.dot}`} />
                          )}
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                        </div>
                        <div className="min-w-0 pb-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`${isSubStep ? 'text-sm' : 'text-base'} font-semibold ${isNotStarted ? 'text-gray-400' : 'text-gray-900'}`}>{step.stepName}</p>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${info.bg} ${info.text}`}>
                              {info.label}
                            </span>
                            {step.requiredBehavior === 'must' && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-300 bg-amber-50">
                                mandatory
                              </span>
                            )}
                            {step.requiredBehavior === 'could' && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 ring-1 ring-inset ring-gray-400 bg-white">
                                policy
                              </span>
                            )}
                            {step.completionCount > 1 && (
                              <span className="text-xs text-gray-400">×{step.completionCount}</span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {step.effectiveDateTime && (
                              <span className="text-xs text-gray-500">{formatDateTime(step.effectiveDateTime)}</span>
                            )}
                            {step.completionStatus && (
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                step.completionStatus === 'LATE'
                                  ? 'text-red-700 bg-red-100'
                                  : step.completionStatus === 'EARLY'
                                    ? 'text-blue-700 bg-blue-100'
                                    : 'text-green-700 bg-green-100'
                              }`}>
                                {step.completionStatus === 'LATE' ? 'SLA BREACHED' : step.completionStatus}
                              </span>
                            )}
                            {step.source && (
                              <span className="text-xs text-gray-500">Source: {step.source}</span>
                            )}
                            {step.practitioner && (
                              <span className="text-xs text-gray-500">Practitioner: {step.practitioner}</span>
                            )}
                            {step.facilityId && (
                              <span className="text-xs text-gray-500">Facility: {step.facilityId}</span>
                            )}
                          </div>
                          {isDeviation && step.description && (
                            <p className="mt-1 text-xs text-red-600">{step.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Compliance Timeline">
          {timeline.isLoading ? <LoadingSpinner /> : timeline.error ? <ErrorAlert error={timeline.error} /> : timeline.data ? (
            <div className="space-y-6">
              {timeline.data.protocols.map((proto) => (
                <div key={proto.protocolInstanceId}>
                  <div className="mb-3 flex items-center gap-2">
                    <StatusBadge
                      label={proto.status}
                      color={STATUS_COLORS[proto.status as ProtocolInstanceStatus] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                    />
                    <span className="text-xs font-medium text-gray-600 truncate">{proto.protocolCanonical}</span>
                  </div>
                  <div className="space-y-0">
                    {proto.timeline.filter((e) => e.type !== 'enrollment').map((entry, i, filtered) => {
                      const dotColor = entry.state && entry.state !== 'ENROLLED'
                        ? (STATE_COLORS[entry.state as StepState]?.dot ?? 'bg-gray-400')
                        : 'bg-indigo-500';
                      const bgHighlight = entry.state === 'OVERDUE' ? 'bg-amber-50' : entry.state === 'MISSED' ? 'bg-red-50' : '';
                      return (
                        <div key={`${proto.protocolInstanceId}-${i}`} className={`flex gap-3 py-2 rounded ${bgHighlight}`}>
                          <div className="flex flex-col items-center">
                            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${dotColor}`} />
                            {i < filtered.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                          </div>
                          <div className="min-w-0 pb-2 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {entry.stepName || entry.actionId || entry.type}
                              </p>
                              {entry.state && entry.state !== 'ENROLLED' && (
                                <StatusBadge
                                  label={entry.state}
                                  color={STATE_COLORS[entry.state as StepState] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                                />
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              {(entry.effectiveDateTime || entry.timestamp) && (
                                <span className="text-xs text-gray-400">{formatDateTime(entry.effectiveDateTime || entry.timestamp)}</span>
                              )}
                              {entry.completionStatus && (
                                <StatusBadge
                                  label={entry.completionStatus}
                                  color={COMPLETION_COLORS[entry.completionStatus as CompletionStatus] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
                                />
                              )}
                              {entry.source && (
                                <span className="text-xs text-gray-400">Source: {entry.source}</span>
                              )}
                              {entry.daysOverdue != null && entry.daysOverdue > 0 && (
                                <span className="text-xs font-medium text-amber-600">{entry.daysOverdue}d overdue</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card title="Deviations">
          {deviations.isLoading ? <LoadingSpinner /> : deviations.error ? <ErrorAlert error={deviations.error} /> : deviations.data && deviations.data.length > 0 ? (
            <div className="space-y-3">
              {deviations.data.map((d) => (
                <div key={d.deviationId} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${d.deviationType === 'OVERDUE' ? 'text-amber-600' : d.deviationType === 'ORDER_VIOLATION' ? 'text-purple-600' : 'text-red-600'}`}>
                        {d.deviationType === 'OVERDUE' ? '⚠' : d.deviationType === 'ORDER_VIOLATION' ? '🔀' : '🔴'} {d.deviationType}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                      ✓ Notification Sent
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">{d.description || d.stepName || d.actionId || 'Unknown Step'}</p>
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
                        color={PROCESSING_COLORS[e.processingStatus as ProcessingStatus] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }}
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
