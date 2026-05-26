// ─── Lookups ─────────────────────────────────────────────────

export interface ProtocolLookup {
  id: string;
  url: string;
  version: string;
  canonical: string;
  status: string;
}

// ─── Response Envelopes ──────────────────────────────────────

export interface ErrorResponse {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

// ─── Global Filters ──────────────────────────────────────────

export interface GlobalFilters {
  startDate?: string;
  endDate?: string;
  facilityId?: string;
}

// ─── Compliance Summaries ────────────────────────────────────

export interface ComplianceSummary {
  protocolDefinitionId: string;
  protocolCanonical: string;
  totalEnrollments: number;
  statusBreakdown: {
    active: number;
    completed: number;
    withdrawn: number;
    expired: number;
  };
  complianceRate: number;
  stepMetrics: {
    totalSteps: number;
    completed: number;
    onTime: number;
    late: number;
    early: number;
    overdue: number;
    missed: number;
    pending: number;
  };
  deviationCount: number;
  deviationBreakdown: {
    overdue: number;
    missed: number;
    orderViolation: number;
  };
}

export interface FacilitySummary {
  facilityId: string;
  totalPatients: number;
  totalEnrollments: number;
  overallComplianceRate: number;
  protocolBreakdown: {
    protocolDefinitionId: string;
    protocolCanonical: string;
    enrollments: number;
    complianceRate: number;
    activeDeviations: number;
  }[];
}

export interface PatientCompliance {
  patientId: string;
  protocolInstanceId: string;
  protocolCanonical: string;
  enrolledAt: string;
  status: ProtocolInstanceStatus;
  complianceRate: number;
  complianceCategory: ComplianceCategory;
  stepsCompleted: number;
  totalSteps: number;
  activeDeviations: number;
  facilityId: string;
}

export type ProtocolInstanceStatus = 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'EXPIRED';
export type ComplianceCategory = 'on_track' | 'at_risk' | 'non_compliant';

// ─── Patient Compliance ──────────────────────────────────────

export interface PatientTimeline {
  patientId: string;
  protocols: {
    protocolInstanceId: string;
    protocolCanonical: string;
    status: ProtocolInstanceStatus;
    complianceRate: number;
    journey: JourneyStep[];
    timeline: TimelineEntry[];
  }[];
}

export interface JourneyStep {
  actionId: string;
  parentActionId?: string;
  stepName: string;
  status: 'COMPLETED' | 'PENDING' | 'NOT_STARTED' | 'OVERDUE' | 'MISSED' | 'SKIPPED' | 'DUE';
  completionCount: number;
  effectiveDateTime?: string;
  completionStatus?: CompletionStatus;
  source?: string;
  depth?: number;
}

export interface TimelineEntry {
  timestamp: string;
  type: 'enrollment' | 'step_completed' | 'step_overdue' | 'step_missed' | 'step_due' | 'step_pending' | 'step_skipped';
  description?: string;
  actionId?: string;
  stepName?: string;
  state?: StepState | 'ENROLLED';
  completionStatus?: CompletionStatus;
  source?: string;
  daysOverdue?: number;
  effectiveDateTime?: string;
}

export interface ProtocolTracking {
  protocolInstanceId: string;
  protocolCanonical: string;
  enrolledAt: string;
  status: ProtocolInstanceStatus;
  complianceRate: number;
  stepsCompleted: number;
  totalSteps: number;
}

export interface ProtocolTrackingDetail {
  protocolInstanceId: string;
  patientId: string;
  protocolCanonical: string;
  status: ProtocolInstanceStatus;
  enrolledAt: string;
  complianceRate: number;
  steps: StepInstance[];
  deviations: DeviationRecord[];
}

export interface StepInstance {
  stepInstanceId: string;
  actionId: string;
  state: StepState;
  dueDate: string | null;
  overdueDate: string | null;
  missedDate: string | null;
  completedAt: string | null;
  completedBySource: string | null;
  completionStatus: CompletionStatus | null;
  daysOverdue?: number;
}

export type StepState = 'PENDING' | 'DUE' | 'OVERDUE' | 'MISSED' | 'COMPLETED' | 'SKIPPED';
export type CompletionStatus = 'EARLY' | 'ON_TIME' | 'LATE';

export interface PatientEvent {
  eventId: string;
  cloudeventsId: string;
  type: string;
  eventTime: string;
  source: string;
  resourceType: string;
  processingStatus: ProcessingStatus;
  facilityId: string | null;
  protocolInstanceId: string | null;
  actionId: string | null;
  matchedStepInstanceId: string | null;
}

export type ProcessingStatus = 'MATCHED' | 'ZERO_MATCH' | 'DUPLICATE';

export interface PatientDeviation {
  deviationId: string;
  protocolInstanceId: string;
  protocolCanonical: string;
  stepInstanceId: string;
  actionId?: string;
  stepName?: string;
  deviationType: DeviationType;
  detectedAt: string;
  metadata?: {
    completedActionId?: string;
    incompletePrerequisites?: string[];
    backfilled?: boolean;
  };
  description?: string;
}

export type DeviationType = 'OVERDUE' | 'MISSED' | 'ORDER_VIOLATION';

// ─── Deviations & Intelligence ───────────────────────────────

export interface DeviationRecord {
  deviationId: string;
  patientId: string;
  protocolInstanceId: string;
  protocolCanonical: string;
  stepInstanceId: string;
  actionId: string;
  deviationType: DeviationType;
  detectedAt: string;
  facilityId: string;
}

export interface DeviationTrend {
  interval: string;
  trends: {
    period: string;
    overdue: number;
    missed: number;
    orderViolation: number;
    total: number;
  }[];
}

export interface DeviationByAction {
  actionId: string;
  protocolDefinitionId: string;
  protocolCanonical: string;
  totalDeviations: number;
  overdueCount: number;
  missedCount: number;
  orderViolationCount: number;
  affectedPatients: number;
}

export interface DeviationResolution {
  totalOverdueDeviations: number;
  resolved: {
    count: number;
    percentage: number;
    avgDaysToResolve: number;
  };
  escalatedToMissed: {
    count: number;
    percentage: number;
  };
  byProtocol: {
    protocolDefinitionId: string;
    protocolCanonical: string;
    totalOverdue: number;
    resolvedCount: number;
    resolutionRate: number;
    escalatedCount: number;
  }[];
}

export interface IntelligenceSummary {
  totalDeviations: number;
  byType: { overdue: number; missed: number; orderViolation: number };
  bySeverity: { warning: number; critical: number };
  recentActivity: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}

// ─── Event Volume ────────────────────────────────────────────

export interface EventVolumeSummary {
  totalEvents: number;
  processingStatusBreakdown: {
    matched?: { count: number; percentage: number };
    zeroMatch?: { count: number; percentage: number };
    duplicate?: { count: number; percentage: number };
  } | null;
  byResourceType: { resourceType: string; count: number }[];
  byFacility: { facilityId: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export interface EventVolumeTrend {
  interval: string;
  trends: {
    period: string;
    total: number;
    byResourceType: Record<string, number>;
  }[];
}

export interface ResourceTypeCount {
  resourceType: string;
  count: number;
  percentage: number;
}

export interface FacilityEventCount {
  facilityId: string;
  totalEvents: number;
  byResourceType: { resourceType: string; count: number }[];
}

export interface PractitionerEventCount {
  practitionerRef: string;
  practitionerDisplay: string | null;
  facilityId: string;
  totalEvents: number;
  byResourceType: { resourceType: string; count: number }[];
}

export interface SourceSystemCount {
  source: string;
  totalEvents: number;
  byResourceType: { resourceType: string; count: number }[];
}

export interface SourceComparison {
  sourceA: string;
  sourceB: string;
  matchWindowSeconds: number;
  sourceASummary: SourceSummary;
  sourceBSummary: SourceSummary;
  overlap: {
    totalOverlappingEvents: number;
    byResourceType: { resourceType: string; count: number }[];
  };
  samples: SourceComparisonSample[];
}

export interface SourceSummary {
  source: string;
  totalEvents: number;
  uniqueEvents: number;
  overlappingEvents: number;
  overlapPercentage: number;
  uniqueByResourceType: { resourceType: string; count: number }[];
}

export interface SourceComparisonSample {
  eventAId: string;
  eventBId: string;
  subject: string;
  resourceType: string;
  eventTimeA: string;
  eventTimeB: string;
  timeDiffSeconds: number;
}

// ─── Protocol Analytics ──────────────────────────────────────

export interface StepAnalytics {
  protocolDefinitionId: string;
  protocolCanonical: string;
  steps: {
    actionId: string;
    totalInstances: number;
    completedCount: number;
    completionRate: number;
    timelinessDistribution: {
      early: number;
      onTime: number;
      late: number;
    };
    overdueCount: number;
    missedCount: number;
    skippedCount: number;
    pendingCount: number;
    avgDaysToComplete: number;
    medianDaysToComplete: number;
  }[];
}

export interface CompletionFunnel {
  protocolDefinitionId: string;
  protocolCanonical: string;
  totalEnrollments: number;
  funnel: {
    actionId: string;
    stepOrder: number;
    reachedCount: number;
    completedCount: number;
    completionRate: number;
    dropOffRate: number;
  }[];
}

export interface OutcomeDistribution {
  protocolDefinitionId: string;
  protocolCanonical: string;
  totalInstances: number;
  distribution: {
    active: { count: number; percentage: number };
    completed: { count: number; percentage: number };
    expired: { count: number; percentage: number };
    withdrawn: { count: number; percentage: number };
  };
}

export interface EnrollmentTrend {
  protocolDefinitionId: string;
  interval: string;
  trends: {
    period: string;
    enrollments: number;
  }[];
}

// ─── Facility Analytics ──────────────────────────────────────

export interface FacilityRanking {
  rank: number;
  facilityId: string;
  facilityName?: string;
  totalEnrollments: number;
  complianceRate: number;
  activeDeviations: number;
  totalEvents: number;
  patientsFromHIE: number;
}

export type RankBy = 'complianceRate' | 'deviationCount' | 'eventVolume';
export type SortOrder = 'asc' | 'desc';

// ─── Processing Quality ──────────────────────────────────────

export interface ProcessingStatusBucket {
  count: number;
  percentage: number;
}

export interface ProcessingQuality {
  totalEvents: number;
  overall: {
    matched?: ProcessingStatusBucket;
    zero_match?: ProcessingStatusBucket;
    duplicate?: ProcessingStatusBucket;
  };
  bySource: {
    source: string;
    totalEvents: number;
    breakdown: {
      matched?: ProcessingStatusBucket;
      zero_match?: ProcessingStatusBucket;
      duplicate?: ProcessingStatusBucket;
    };
  }[];
}

// ─── Patient Risk ────────────────────────────────────────────

export interface FacilityLookup {
  id: string;
  name: string;
}

export interface AtRiskHotspot {
  facilityId: string;
  facilityName?: string;
  totalPatients: number;
  onTrack: { count: number; percentage: number };
  atRisk: { count: number; percentage: number };
  nonCompliant: { count: number; percentage: number };
}

export interface RepeatDeviationPatient {
  patientId: string;
  totalDeviations: number;
  overdueCount: number;
  missedCount: number;
  orderViolationCount: number;
  affectedProtocols: number;
  affectedSteps: number;
  facilityId: string;
  deviations: {
    protocolCanonical: string;
    actionId: string;
    deviationType: DeviationType;
    detectedAt: string;
  }[];
}

// ─── Ingestion Analytics ─────────────────────────────────────

export interface IngestionFunnel {
  totalReceived: number;
  accepted: number;
  rejected: number;
  duplicate: number;
  acceptanceRate: number;
  rejectionRate: number;
  duplicateRate: number;
  breakdown: { status: string; count: number; percentage: number }[];
  trends?: {
    period: string;
    byStatus: Record<string, number>;
    total: number;
  }[];
}

export interface RejectionAnalytics {
  totalRejected: number;
  byReason: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  bySource: {
    source: string;
    totalEvents: number;
    rejectedEvents: number;
    rejectionRate: number;
    topReasons: { reason: string; count: number; percentage: number }[];
  }[];
}

export type RejectionReason =
  | 'INVALID_ENVELOPE'
  | 'INVALID_FHIR'
  | 'INVALID_JSON'
  | 'UNSUPPORTED_CONTENT_TYPE'
  | 'DUPLICATE'
  | 'MISSING_SUBJECT'
  | 'PAYLOAD_TOO_LARGE'
  | 'DESERIALIZATION_ERROR'
  | 'KAFKA_PUBLISH_FAILURE'
  | 'INTERNAL_ERROR';

export interface SourceDataQuality {
  sources: {
    source: string;
    totalEvents: number;
    accepted: number;
    rejected: number;
    duplicate: number;
    acceptanceRate: number;
    rejectionRate: number;
    duplicateRate: number;
  }[];
}

export interface PipelineLoss {
  totalAcceptedByCollector: number;
  totalInComplianceEventLog: number;
  lostEvents: number;
  lossRate: number;
  bySource: { source: string; lostEvents: number }[];
}
