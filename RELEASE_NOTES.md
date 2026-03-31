# Release Notes — CCE Insights UI v1.0.0

**Release Date:** 2026-03-31

## Overview

Initial release of the CCE Insights UI — an analytics dashboard for the Clinical Care Engine platform. Provides compliance analytics, deviation trends, event volume metrics, facility rankings, patient risk analysis, and ingestion pipeline monitoring by consuming 33 REST endpoints from the CCE Insights Service.

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
- **Cursor-based pagination** throughout all paginated views
- **Global filters** (date range + facility) applied across all data queries via React Context
- **Docker deployment** — multi-stage build (node:20 → caddy:2-alpine), Caddy reverse proxy to insights-service

### API Integration

- 33 endpoints consumed across 9 API groups
- Centralized API client with shared URL builder, auth header injection, and error handling
- Relative URL support for Docker (Caddy proxy) and absolute URL support for local development

## Docker Deployment

```bash
docker compose up -d --build
# UI available at http://localhost:3001
# API proxied to cce-insights-service:8084 on deploy-scripts_cce-net
```

## Known Limitations

- Protocol and Facility IDs are entered as free text (no dropdown selection from API)
- OAuth/gateway integration is stubbed (`VITE_AUTH_ENABLED=false`) — no gateway deployed locally
- No unit tests shipped in v1.0.0 (test infrastructure is in place with Vitest + Testing Library + MSW)
