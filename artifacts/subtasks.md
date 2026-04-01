# CCE Insights UI — JIRA Subtasks (Sequential Execution)

**Epic:** CCE Insights UI — Analytics Dashboard  
**Component:** `cce-insights-ui`  
**Sprint Target:** Release 1.0.0  
**Total Subtasks:** 12  
**Total Story Points:** 45  
**Total Pages:** 11 | **Total Insights Service Endpoints Consumed:** 38 (33 analytics + 5 lookup)  
**Status:** ✅ All subtasks implemented and deployed

> All subtasks have been implemented. The UI is deployed as a Docker container (`cce-insights-ui`)
> on the `deploy-scripts_cce-net` network, directly proxying API calls to `cce-insights-service:8084` via Caddy.
> Post-release fixes include: ISO date format, error unwrapping, status casing, null-safe rendering,
> ingestion chart colors, `VITE_AUTH_TOKEN` config, and lookup API integration.

---

## Subtask S0: Technical Documentation & Design Artifacts

**Type:** Task  
**Priority:** Highest  
**Story Points:** 3  
**Labels:** `documentation`, `design`

**Description:**  
Create comprehensive technical documentation covering architecture, page wireframes, API integration reference, developer setup, and AI agent instructions for the Insights UI — an analytics dashboard consuming 33 Insights Service endpoints.

**Acceptance Criteria:**
- [x] `copilot-instructions-insights-ui.md` — AI agent instructions: architecture, tech stack, 11 pages, ~60 file structure, 33 API endpoints, design patterns, global filters, color conventions
- [x] `architecture-overview.md` — System context, tech stack, application architecture layers, page hierarchy, data flow with TanStack Query + global filter context, state management, routing (11 routes), styling (compliance/step/processing palettes), error handling, performance, deployment
- [x] `pages-and-wireframes.md` — ASCII wireframes for all 11 pages: Dashboard, Compliance Overview, Protocol Analytics, Patient List, Patient Detail, Deviations, Event Volume, Source Comparison, Facility Analytics, Ingestion Pipeline, Exports; shared component specs (MetricCard, badges, DateRangePicker, IntervalSelector, CursorPagination, DataTable)
- [x] `api-integration.md` — Base API client with envelope unwrapping, ~30 TypeScript interfaces, 10 API modules (compliance, patients, deviations, events, protocols, facilities, ingestion, exports), TanStack Query hooks with global filter integration, error handling, CORS options
- [x] `developer-setup.md` — Prerequisites, backend dependency chain, quick start, env variables, project initialization, npm scripts, testing (Vitest + MSW), Docker build, demo workflow (10-step sequence)

**Files:**
- `copilot-instructions-insights-ui.md`
- `architecture-overview.md`
- `pages-and-wireframes.md`
- `api-integration.md`
- `developer-setup.md`

---

## Subtask S1: Project Scaffolding — Vite + React + TypeScript + Tailwind

**Type:** Task  
**Priority:** Highest  
**Story Points:** 2  
**Labels:** `setup`, `infrastructure`

**Description:**  
Initialize the React project with Vite, TypeScript, Tailwind CSS, and all required dependencies. Configure build tooling, linting, and dev server proxy for the Insights Service.

**Acceptance Criteria:**
- [x] `npm create vite@latest` with `react-ts` template
- [x] Install dependencies: `react-router-dom`, `@tanstack/react-query`, `recharts`, `date-fns`, `@heroicons/react`
- [x] Install dev dependencies: `tailwindcss`, `@tailwindcss/vite`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`
- [x] `vite.config.ts` with React plugin, Tailwind plugin, port 3001, proxy for `/v1` → `http://localhost:8084`
- [x] `src/index.css` with Tailwind import
- [x] `.env` + `.env.example` with `VITE_API_BASE_URL=http://localhost:8084`, `VITE_AUTH_ENABLED=false`, `VITE_POLLING_INTERVAL=60000`, `VITE_DEFAULT_DATE_RANGE_DAYS=30`
- [x] `.gitignore` for node_modules, dist, .env.local
- [x] `npm run dev` starts on port 3001
- [x] `npm run build` produces `dist/` with no errors

**Files:**
- `package.json`, `package-lock.json`
- `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- `.env`, `.env.example`, `.gitignore`

---

## Subtask S2: API Client Layer — Types, Fetch Wrappers, Query Hooks

**Type:** Task  
**Priority:** Highest  
**Story Points:** 5  
**Labels:** `api`, `data-layer`

**Description:**  
Implement the typed API client layer — all TypeScript interfaces matching the 33 Insights Service response schemas, base fetch wrapper with `{ data }` envelope unwrapping, per-resource API functions (10 modules), and TanStack Query hooks (10 hooks) with global filter integration.

**Acceptance Criteria:**
- [x] `src/api/types.ts` — ~30 interfaces covering all 38 endpoint responses: `ProtocolLookup`, `ComplianceSummary`, `FacilitySummary`, `PatientCompliance`, `PatientTimeline`, `ProtocolTracking`, `ProtocolTrackingDetail`, `StepInstance`, `PatientEvent`, `PatientDeviation`, `DeviationRecord`, `DeviationTrend`, `DeviationByAction`, `DeviationResolution`, `IntelligenceSummary`, `EventVolumeSummary`, `EventVolumeTrend`, `ResourceTypeCount`, `FacilityEventCount`, `PractitionerEventCount`, `SourceSystemCount`, `SourceComparison`, `StepAnalytics`, `CompletionFunnel`, `OutcomeDistribution`, `EnrollmentTrend`, `FacilityRanking`, `ProcessingQuality`, `AtRiskHotspot`, `RepeatDeviationPatient`, `IngestionFunnel`, `RejectionAnalytics`, `SourceDataQuality`, `PipelineLoss` + enums + `PaginatedResponse<T>`, `ErrorResponse`, `GlobalFilters`
- [x] `src/api/client.ts` — `apiGet<T>()` with envelope unwrapping, `apiGetPaginated<T>()` for cursor-based pagination, `ApiError` class, optional OAuth header (`VITE_AUTH_TOKEN` or sessionStorage)
- [x] `src/api/compliance.ts` — 3 functions: protocol summary, facility summary, protocol patients
- [x] `src/api/patients.ts` — 7 functions: timeline, tracking list, tracking detail, events, deviations, at-risk hotspots, repeat deviations
- [x] `src/api/deviations.ts` — 5 functions: list, trends, by-action, resolution-rate, intelligence summary
- [x] `src/api/events.ts` — 8 functions: summary, trends, by-resource-type, by-facility, by-practitioner, by-source, source-comparison, processing-quality
- [x] `src/api/protocols.ts` — 4 functions: step-analytics, completion-funnel, outcome-distribution, enrollment-trends
- [x] `src/api/facilities.ts` — 1 function: ranking
- [x] `src/api/ingestion.ts` — 4 functions: funnel, rejections, source-quality, pipeline-loss
- [x] `src/api/exports.ts` — 1 function: export URL builder
- [x] `src/api/lookups.ts` — 5 functions: protocols, facilities, practitioners, sources, patients
- [x] `src/hooks/` — 10 hook files with TanStack Query wrappers, global filter integration (incl. `useLookups.ts`)
- [x] Unit tests for `apiGet` envelope unwrapping, error handling (404, 500, network error)

**Files:**
- `src/api/types.ts`, `src/api/client.ts`
- `src/api/compliance.ts`, `src/api/patients.ts`, `src/api/deviations.ts`
- `src/api/events.ts`, `src/api/protocols.ts`, `src/api/facilities.ts`
- `src/api/ingestion.ts`, `src/api/exports.ts`, `src/api/lookups.ts`
- `src/hooks/useComplianceSummary.ts`, `src/hooks/useProtocols.ts`
- `src/hooks/usePatients.ts`, `src/hooks/useDeviations.ts`
- `src/hooks/useEventVolume.ts`, `src/hooks/useFacilities.ts`
- `src/hooks/useIngestion.ts`, `src/hooks/useLookups.ts`
- `src/hooks/useSourceComparison.ts`, `src/hooks/useGlobalFilters.ts`

---

## Subtask S3: Utilities, Global Filter Context & Shared Constants

**Type:** Task  
**Priority:** Highest  
**Story Points:** 3  
**Labels:** `utils`, `context`

**Description:**  
Implement pure utility functions, the global filter context (date range + facility), and configuration constants. The filter context persists across page navigation and drives all API calls.

**Acceptance Criteria:**
- [x] `src/context/FilterContext.tsx` — React context providing `{ startDate, endDate, facilityId, setDateRange, setFacilityId }`. Default date range: last N days (from `VITE_DEFAULT_DATE_RANGE_DAYS`). Synced with URL search params for shareability.
- [x] `src/utils/colors.ts` — `STATE_COLORS` (6 step states), `COMPLIANCE_COLORS` (3 categories), `STATUS_COLORS` (4 protocol statuses), `PROCESSING_COLORS` (3 statuses), `COMPLETION_COLORS` (3 timeliness), `CHART_COLORS` (theme palette)
- [x] `src/utils/dates.ts` — `formatDate()`, `formatDateTime()`, `formatRelative()`, `daysUntil()`, `daysSince()`, `toUtcString()`, `getDefaultDateRange(days)`
- [x] `src/utils/formatters.ts` — `formatNumber()` (locale-aware), `formatPercentage()`, `formatRate()` (0.72 → "72%")
- [x] `src/utils/compliance.ts` — `parseCanonicalUrl(canonical)` → `{ url, version, name }`, `classifyComplianceCategory(steps)`
- [x] `src/utils/pagination.ts` — `buildCursorParams()` helper
- [x] `src/config.ts` — `DEFAULT_PAGE_SIZE`, `INTERVAL_OPTIONS`, `RANK_BY_OPTIONS`, `SORT_ORDER_OPTIONS`, `DEVIATION_TYPE_OPTIONS`, `COMPLIANCE_STATUS_OPTIONS`
- [x] Unit tests for all utility functions and filter context behavior

**Files:**
- `src/context/FilterContext.tsx`
- `src/utils/colors.ts`, `src/utils/dates.ts`, `src/utils/formatters.ts`
- `src/utils/compliance.ts`, `src/utils/pagination.ts`
- `src/config.ts`
- Tests for all utils

---

## Subtask S4: Layout Shell & Common Components

**Type:** Task  
**Priority:** Highest  
**Story Points:** 5  
**Labels:** `ui`, `components`

**Description:**  
Build the application shell (sidebar with navigation groups, header with global filters, content area) and all shared/reusable components used across the 11 pages.

**Acceptance Criteria:**
- [x] `AppLayout.tsx` — Sidebar + Header + `<Outlet/>`, responsive: sidebar collapsible
- [x] `Sidebar.tsx` — Navigation groups: Overview, Compliance, Events & Activity, Deviations, Facilities, Operations, Exports. Active route highlighting.
- [x] `Header.tsx` — Page title, global `DateRangePicker`, global `FacilitySelector` (dropdown)
- [x] `FilterBar.tsx` — Wires `DateRangePicker` + facility selector to `FilterContext`
- [x] `DateRangePicker.tsx` — Presets (7d, 30d, 90d, custom) + custom date inputs
- [x] `MetricCard.tsx` — Label, value, icon, optional trend indicator (↑/↓/−)
- [x] `StateBadge.tsx` — Step state color pill (6 states)
- [x] `ComplianceBadge.tsx` — Compliance category badge (on_track/at_risk/non_compliant)
- [x] `DeviationTypeBadge.tsx` — OVERDUE (amber) / MISSED (red) badge
- [x] `ProcessingStatusBadge.tsx` — MATCHED/ZERO_MATCH/DUPLICATE badge
- [x] `PercentageBar.tsx` — Horizontal stacked percentage bar
- [x] `DataTable.tsx` — Generic table with sort headers, loading skeleton, empty state
- [x] `CursorPagination.tsx` — Previous/Next with cursor management
- [x] `EmptyState.tsx` — No data placeholder
- [x] `LoadingSpinner.tsx` — Tailwind spinner
- [x] React Router configured in `App.tsx` with `QueryClientProvider` + `FilterProvider`
- [x] Component tests for badges (all variants), MetricCard, DateRangePicker

**Files:**
- `src/components/layout/AppLayout.tsx`, `Sidebar.tsx`, `Header.tsx`, `FilterBar.tsx`
- `src/components/common/DateRangePicker.tsx`, `MetricCard.tsx`, `StateBadge.tsx`
- `src/components/common/ComplianceBadge.tsx`, `DeviationTypeBadge.tsx`, `ProcessingStatusBadge.tsx`
- `src/components/common/PercentageBar.tsx`, `DataTable.tsx`, `CursorPagination.tsx`
- `src/components/common/EmptyState.tsx`, `LoadingSpinner.tsx`
- Updated `src/App.tsx`

---

## Subtask S5: Chart Components (10 charts)

**Type:** Task  
**Priority:** High  
**Story Points:** 5  
**Labels:** `ui`, `charts`

**Description:**  
Implement all Recharts wrapper components. Each chart accepts processed data arrays as props and renders with consistent styling, tooltips, and color scheme.

**Acceptance Criteria:**
- [x] `ComplianceRateChart.tsx` — Horizontal bar chart: protocols by compliance rate
- [x] `DeviationTrendChart.tsx` — Stacked area chart: overdue + missed over time periods
- [x] `EventVolumeTrendChart.tsx` — Stacked area chart: event volume by resource type over time
- [x] `CompletionFunnelChart.tsx` — Funnel/waterfall chart: patient drop-off per step
- [x] `OutcomeDistributionChart.tsx` — Pie/donut chart: ACTIVE/COMPLETED/WITHDRAWN/EXPIRED
- [x] `FacilityRankingChart.tsx` — Horizontal bar chart: facility leaderboard by selected metric
- [x] `ProcessingQualityChart.tsx` — Stacked bar chart: MATCHED/ZERO_MATCH/DUPLICATE per source
- [x] `IngestionFunnelChart.tsx` — Funnel chart: ACCEPTED/REJECTED/DUPLICATE pipeline
- [x] `RiskHeatmapChart.tsx` — Stacked horizontal bar: on_track/at_risk/non_compliant per facility
- [x] `EnrollmentTrendChart.tsx` — Line chart: enrollments over time
- [x] All charts use `CHART_COLORS` from `utils/colors.ts`
- [x] All charts include tooltips and responsive containers
- [x] Component tests for at least 3 charts with mock data

**Files:**
- `src/components/charts/ComplianceRateChart.tsx`
- `src/components/charts/DeviationTrendChart.tsx`
- `src/components/charts/EventVolumeTrendChart.tsx`
- `src/components/charts/CompletionFunnelChart.tsx`
- `src/components/charts/OutcomeDistributionChart.tsx`
- `src/components/charts/FacilityRankingChart.tsx`
- `src/components/charts/ProcessingQualityChart.tsx`
- `src/components/charts/IngestionFunnelChart.tsx`
- `src/components/charts/RiskHeatmapChart.tsx`
- `src/components/charts/EnrollmentTrendChart.tsx`

---

## Subtask S6: Dashboard Page

**Type:** Story  
**Priority:** High  
**Story Points:** 3  
**Labels:** `ui`, `pages`

**Description:**  
Implement the Dashboard landing page with 6 metric cards, deviation trend sparkline, event volume sparkline, and quick navigation links to all major sections.

**Acceptance Criteria:**
- [x] `DashboardPage.tsx` with 6 MetricCards: Total Events, Active Deviations, Facilities Tracked, Pipeline Loss Rate, Match Rate, At-Risk Patients
- [x] DeviationTrendChart — mini area chart (last 30 days from `deviations/trends`)
- [x] EventVolumeTrendChart — mini stacked area (last 30 days from `events/trends`)
- [x] Quick Navigation cards linking to: Compliance, Facilities, Ingestion, Exports
- [x] Auto-refresh with `refetchInterval` from env
- [x] Loading skeletons while data loads
- [x] Error states with retry
- [x] Component tests with MSW mocks

**Files:**
- `src/pages/DashboardPage.tsx`

---

## Subtask S7: Compliance Pages (Overview + Protocol Analytics + Patient List + Patient Detail)

**Type:** Story  
**Priority:** High  
**Story Points:** 8  
**Labels:** `ui`, `pages`, `compliance`

**Description:**  
Implement the 4 compliance-focused pages: Compliance Overview (protocol/facility summaries + patient table), Protocol Analytics (step analytics, funnel, outcomes, enrollment trends), Patient List (compliance categories + risk hotspots), and Patient Detail (timeline, tracking, events, deviations).

**Acceptance Criteria:**
- [x] **ComplianceOverviewPage.tsx** — Protocol selector dropdown, compliance summary card (metrics + step breakdown), patient compliance table with category filter + cursor pagination, "View Protocol Analytics →" navigation
- [x] **ProtocolAnalyticsPage.tsx** — Step analytics table (per-action rates, timeliness, avg/median days), CompletionFunnelChart, OutcomeDistributionChart, EnrollmentTrendChart with interval selector
- [x] **PatientListPage.tsx** — RiskHeatmapChart (at-risk hotspots by facility), patient table with compliance category filter + repeat deviations threshold, cursor pagination, row click → patient detail
- [x] **PatientDetailPage.tsx** — Protocol tracking cards (enrollment summaries), compliance timeline (chronological events + steps), deviation list panel, event history table with filters
- [x] Patient components: `ComplianceTimeline.tsx`, `ProtocolTrackingCard.tsx`, `StepInstanceTable.tsx`, `PatientDeviationList.tsx`
- [x] Global filters (date range + facility) applied to all queries
- [x] Loading, error, and empty states on all pages
- [x] Component tests for ComplianceOverviewPage and PatientDetailPage

**Files:**
- `src/pages/ComplianceOverviewPage.tsx`
- `src/pages/ProtocolAnalyticsPage.tsx`
- `src/pages/PatientListPage.tsx`
- `src/pages/PatientDetailPage.tsx`
- `src/components/patient/ComplianceTimeline.tsx`
- `src/components/patient/ProtocolTrackingCard.tsx`
- `src/components/patient/StepInstanceTable.tsx`
- `src/components/patient/PatientDeviationList.tsx`

---

## Subtask S8: Deviations Page

**Type:** Story  
**Priority:** High  
**Story Points:** 3  
**Labels:** `ui`, `pages`, `deviations`

**Description:**  
Implement the Deviations page — deviation trends, most-deviated steps, resolution rate, intelligence summary, and paginated deviation list.

**Acceptance Criteria:**
- [x] **DeviationsPage.tsx** — 4 metric cards (total deviations, overdue, missed, resolution rate)
- [x] DeviationTrendChart with interval selector (daily/weekly/monthly)
- [x] Most Deviated Steps table (by-action): action, total, overdue, missed, affected patients
- [x] Resolution Rate card: resolved % vs escalated %, avg days to resolve, by-protocol breakdown
- [x] Deviation list table with filters (type, protocol, facility) + sort + cursor pagination
- [x] Global filters applied
- [x] Loading, error, and empty states
- [x] Component tests

**Files:**
- `src/pages/DeviationsPage.tsx`

---

## Subtask S9: Event Volume & Source Comparison Pages

**Type:** Story  
**Priority:** High  
**Story Points:** 5  
**Labels:** `ui`, `pages`, `events`

**Description:**  
Implement the Event Volume page (summary, trends, 5 dimension tabs, processing quality) and the Source Comparison page (source selector, overlap analysis, sample pairs).

**Acceptance Criteria:**
- [x] **EventVolumePage.tsx** — 4 metric cards (total events, matched rate, zero-match rate, duplicate rate)
- [x] EventVolumeTrendChart with interval selector
- [x] 5 sub-tabs: By Resource Type (bar + table), By Facility (table), By Practitioner (table), By Source (table with status breakdown), Processing Quality (stacked bar per source)
- [x] All sub-tabs: cursor pagination where applicable, global filters
- [x] "Compare Sources →" link to source comparison page
- [x] **SourceComparisonPage.tsx** — 2 source selector dropdowns, match window input, Compare button
- [x] Overlap summary cards (Source A unique, Source B unique, overlapping, percentages)
- [x] Overlap by resource type bar chart
- [x] Sample pairs table (patient, resource type, time A, time B, diff)
- [x] Loading, error, and empty states
- [x] Component tests for EventVolumePage

**Files:**
- `src/pages/EventVolumePage.tsx`
- `src/pages/SourceComparisonPage.tsx`

---

## Subtask S10: Facility Analytics Page

**Type:** Story  
**Priority:** High  
**Story Points:** 3  
**Labels:** `ui`, `pages`, `facilities`

**Description:**  
Implement the Facility Analytics page — facility ranking leaderboard, ranking chart, and at-risk hotspots.

**Acceptance Criteria:**
- [x] **FacilityAnalyticsPage.tsx** — Rank By selector (compliance rate, deviation count, event volume), Order selector (best/worst first), Protocol filter
- [x] FacilityRankingChart — horizontal bar chart showing top facilities by selected metric
- [x] Facility ranking table — rank, facility ID, enrollments, compliance rate, deviations, events
- [x] At-risk hotspots section — stacked bar by facility showing on_track/at_risk/non_compliant patient distribution
- [x] Cursor pagination on ranking table
- [x] Global filters applied
- [x] Component tests

**Files:**
- `src/pages/FacilityAnalyticsPage.tsx`

---

## Subtask S11: Ingestion Pipeline Page

**Type:** Story  
**Priority:** High  
**Story Points:** 3  
**Labels:** `ui`, `pages`, `operations`

**Description:**  
Implement the Ingestion Pipeline page — ingestion funnel, rejection reason analytics, source quality scorecard, and pipeline loss detection.

**Acceptance Criteria:**
- [x] **IngestionPage.tsx** — 4 metric cards (received, acceptance rate, rejection rate, pipeline loss)
- [x] IngestionFunnelChart — funnel showing RECEIVED → ACCEPTED → REJECTED → DUPLICATE
- [x] Rejection reasons bar chart — by `RejectionReason` enum values
- [x] Per-source rejection detail: source, total events, rejected count, rate, top reasons
- [x] Source quality table — per-source acceptance, rejection, duplicate rates
- [x] Pipeline loss card — lost count, loss rate, by source
- [x] Optional trend view when interval parameter is provided
- [x] Global filters applied
- [x] Component tests

**Files:**
- `src/pages/IngestionPage.tsx`

---

## Subtask S12: Exports Page + Docker + Polish

**Type:** Story  
**Priority:** Medium  
**Story Points:** 2  
**Labels:** `ui`, `pages`, `deployment`

**Description:**  
Implement the Exports page, Dockerfile, Caddy config, docker-compose.yml, and final polish (loading states, 404 page, favicon).

**Acceptance Criteria:**
- [x] **ExportsPage.tsx** — Export config form: format (JSON/CSV radio), protocol selector, facility selector, date range; Download button triggers file download
- [x] `Dockerfile` — multi-stage build (node → caddy)
- [x] `Caddyfile` — SPA fallback + `/v1/insights/*` reverse proxy to Insights Service using `handle` blocks
- [x] `docker-compose.yml` — insights-ui container joining `deploy-scripts_cce-net` external network (insights-service runs separately)
- [x] 404 Not Found page for unmatched routes
- [x] Favicon and page title set to "CCE Insights"
- [x] `README.md` with quick start, screenshots placeholder, tech stack summary
- [x] `docker build` + `docker run` succeeds
- [x] All pages reachable, no console errors

**Files:**
- `src/pages/ExportsPage.tsx`
- `Dockerfile`, `Caddyfile`, `docker-compose.yml`, `.dockerignore`
- `src/pages/NotFoundPage.tsx`
- `README.md`
