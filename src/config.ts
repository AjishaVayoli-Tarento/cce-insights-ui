export const DEFAULT_PAGE_SIZE = 50;

export const INTERVAL_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const RANK_BY_OPTIONS = [
  { value: 'complianceRate', label: 'Compliance Rate' },
  { value: 'deviationCount', label: 'Deviation Count' },
  { value: 'eventVolume', label: 'Event Volume' },
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Best First' },
  { value: 'asc', label: 'Worst First' },
] as const;

export const DEVIATION_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'missed', label: 'Missed' },
  { value: 'orderViolation', label: 'Order Violation' },
] as const;

export const COMPLIANCE_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'on_track', label: 'Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
] as const;
