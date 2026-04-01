# Release Notes — CCE Insights UI v1.0.0

**Release Date:** 2026-03-31

## Overview

Initial release of the CCE Insights UI — an analytics dashboard for the Clinical Care Engine platform. Provides compliance analytics, deviation trends, event volume metrics, facility rankings, patient risk analysis, and ingestion pipeline monitoring by consuming 38 REST endpoints (33 analytics + 5 lookup) from the CCE Insights Service.

## Features

### Pages (11 routes)

- **Dashboard** — Overview metrics (total events, active deviations, facilities tracked, pipeline loss rate), trend sparklines, quick navigation
- **Compliance Overview** — Protocol compliance summaries with status breakdown, step metrics, patient list with status filtering
- **Protocol Analytics** — Step-level analytics table, completion funnel, outcome distribution, enrollment trends with interval toggle
- **Patient List** — Patients by compliance status, risk hotspots by facility (stacked bar chart), repeat deviation patients
- **Patient Detail** — Protocol enrollments with progress bars, step-level detail, compliance timeline, deviation list, event history
- **Deviation Analytics** — Intelligence summary, deviation trends (daily/weekly/monthly), most-deviated steps, resolution rate, paginated deviation list with type filter
- **Event Volume** — Tabbed view: by resource type (bar chart), by facility, by practitioner, by source, processing quality chart
- **Source Comparison** — Compare two source systems for event overlap with sample pairs table
- **Facility Analytics** — Ranked leaderboard (by compliance rate, deviation count, or event volume), at-risk hotspot chart
- **Ingestion Pipeline** — Acceptance/rejection funnel, rejection reasons (horizontal bars), source quality, pipeline loss alert
- **Exports** — Download compliance data as CSV or JSON with protocol/facility/date filters

### Technical

- **React 18** with TypeScript 5, lazy-loaded route-based code splitting
- **TanStack Query 5** for server state with auto-polling on key dashboards
- **Tailwind CSS 4** for utility-first styling
- **Recharts 2** for charts (area, bar, pie, funnel)
- **keycloak-js** for Keycloak OIDC authentication (PKCE, auto-refresh)
- **Cursor-based pagination** throughout all paginated views
- **Global filters** (date range + facility) applied across all data queries via React Context
- **Docker deployment** — multi-stage build (node:20 → caddy:2-alpine), Caddy reverse proxy to insights-service

### API Integration

- 38 endpoints consumed across 10 API groups (9 analytics + 1 lookups)
- Centralized API client with shared URL builder, auth header injection (`VITE_AUTH_TOKEN` or `sessionStorage`), and error handling
- Lookups API (`/lookups/protocols`, `/lookups/facilities`, `/lookups/practitioners`, `/lookups/sources`, `/lookups/patients`) for populating selectors
- Relative URL support for Docker (Caddy proxy) and absolute URL support for local development

## Docker Deployment

```bash
docker compose up -d --build
# UI available at http://localhost:3001
# API proxied to cce-insights-service:8084 on deploy-scripts_cce-net
```

## Known Limitations

- Protocol and Facility IDs are entered as free text (no dropdown selection from API)
- OAuth/gateway integration is configurable (`VITE_AUTH_ENABLED=true` + `VITE_AUTH_TOKEN`) — no gateway deployed locally
- No unit tests shipped in v1.0.0 (test infrastructure is in place with Vitest + Testing Library + MSW)

---

## Bug Fixes (post-release)

### Date format mismatch (Invalid request: undefined)
All API calls failed with `Invalid request: undefined` because the UI sent dates as `YYYY-MM-DD` but the Insights Service expects ISO 8601 `OffsetDateTime` (`2026-03-01T00:00:00Z`). The `useGlobalFilters` hook now converts dates via `toStartOfDayISO()` / `toEndOfDayISO()`.

### Error body unwrapping
The API returns errors as `{ error: { code, message } }` but `handleResponse` passed the outer object — so `body.message` was `undefined`. Fixed to unwrap `raw.error ?? raw`.

### ProtocolInstanceStatus casing (blank Patient Detail page)
The API returns `status: "ACTIVE"` (uppercase) but `STATUS_COLORS` had lowercase keys (`active`). Lookup returned `undefined`, then `color.bg` in `StatusBadge` crashed React. Changed `ProtocolInstanceStatus` type and `STATUS_COLORS` to uppercase (`ACTIVE`, `COMPLETED`, `WITHDRAWN`, `EXPIRED`). Added fallback colors for all badge lookups.

### Null-safe numeric rendering (toFixed / toLocaleString on null)
Several API fields return `null` instead of a number (`processingStatusBreakdown`, `avgDaysToResolve`, `lossRate`, etc.). All formatter functions (`formatNumber`, `formatPercentage`, `formatRate`) now accept `null | undefined` and return `'—'`. All pages guard nullable nested objects before accessing properties.

### ProcessingQuality data shape mismatch
The `processing-quality` API nests status counts under a `breakdown` object per source (`bySource[].breakdown.matched.count`) and uses `zero_match` (snake_case). The chart component now reads `d.breakdown?.matched?.count ?? 0` and handles missing fields gracefully.

### API client refactoring
Extracted shared `buildUrl()`, `authHeaders()`, and `handleResponse()` helpers from duplicated code in `apiGet` and `apiGetPaginated`. Changed default `BASE_URL` from `http://localhost:8084` to empty string (relative URLs) so Caddy proxy works in Docker. The exports module now reuses `buildUrl()` from the client.

### Caddy directive ordering
Initial Caddyfile used `try_files` and `reverse_proxy` at the same level, causing `try_files` to run before the proxy. Fixed by using `handle` blocks for proper routing precedence.

### Ingestion funnel chart colors
Both ACCEPTED and REJECTED bars rendered in black because the chart used raw `<rect>` elements instead of Recharts `<Cell>` components. Fixed to use `<Cell>` with proper color mapping: ACCEPTED (green `#22c55e`), REJECTED (red `#ef4444`).

### Auth token configuration
Added `VITE_AUTH_TOKEN` build-time environment variable for providing a gateway bearer token. When `VITE_AUTH_ENABLED=true`, the token is read from `VITE_AUTH_TOKEN` first, falling back to `sessionStorage('access_token')`.

### Keycloak OIDC integration
Added full Keycloak authentication support via `keycloak-js`. When `VITE_AUTH_ENABLED=true` and `VITE_KEYCLOAK_URL` is set, the app initializes Keycloak with Authorization Code flow + PKCE before rendering. The token is auto-refreshed every 30 seconds. Token priority: `VITE_AUTH_TOKEN` (static override) → `keycloak.token` (OIDC) → `sessionStorage('access_token')` (manual). New env variables: `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`. When Keycloak is not configured, the app renders normally (demo mode).

### Lookup API integration
Added `src/api/lookups.ts` module with 5 lookup endpoints (`/lookups/protocols`, `/lookups/facilities`, `/lookups/practitioners`, `/lookups/sources`, `/lookups/patients`) and corresponding `useLookups.ts` hook with 5-minute `staleTime` for populating protocol/facility/source selectors.
