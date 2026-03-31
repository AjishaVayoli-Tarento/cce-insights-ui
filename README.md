# CCE Insights UI

**Analytics dashboard** for the Clinical Care Engine (CCE) platform. Consumes 33 REST endpoints from the CCE Insights Service to provide compliance analytics, deviation trends, event volume metrics, facility rankings, patient risk analysis, and ingestion pipeline monitoring.

## Architecture

```
Insights UI (React 18) → CCE Gateway (OAuth) → Insights Service (port 8084) → PostgreSQL (read-only)
```

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 6 |
| Routing | React Router 7 |
| Server State | TanStack Query 5 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 2 |
| Icons | Heroicons 2 |
| Dates | date-fns 4 |
| Testing | Vitest + Testing Library + MSW |

## Quick Start

```bash
# Prerequisites: Insights Service running on port 8084
npm install
npm run dev          # http://localhost:3001
```

## Pages (11 routes)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Overview metrics, trend sparklines, quick navigation |
| `/compliance` | Compliance Overview | Protocol & facility compliance summaries |
| `/compliance/protocols/:id` | Protocol Analytics | Step analytics, completion funnel, outcomes, enrollment trends |
| `/compliance/patients` | Patient List | Patients by compliance status, risk hotspots |
| `/compliance/patients/:id` | Patient Detail | Timeline, protocol tracking, events, deviations |
| `/deviations` | Deviations | Trends, most-deviated steps, resolution rate |
| `/events` | Event Volume | Volume by resource type, facility, practitioner, source |
| `/events/source-comparison` | Source Comparison | Compare two source systems for overlap |
| `/facilities` | Facility Analytics | Facility rankings, at-risk hotspots |
| `/ingestion` | Ingestion Pipeline | Funnel, rejections, source quality, pipeline loss |
| `/exports` | Exports | Download compliance data as CSV/JSON |

## Insights Service Endpoints Consumed (33)

| Group | Endpoints | Path Prefix |
|-------|-----------|-------------|
| Compliance Summaries | 3 | `/v1/insights/protocols/`, `/v1/insights/facilities/` |
| Patient Compliance | 5 | `/v1/insights/patients/` |
| Deviations & Intelligence | 5 | `/v1/insights/deviations/`, `/v1/insights/intelligence/` |
| Event Volume | 8 | `/v1/insights/events/` |
| Protocol Analytics | 4 | `/v1/insights/protocols/{id}/` |
| Facility Analytics | 1 | `/v1/insights/facilities/ranking` |
| Patient Risk | 2 | `/v1/insights/patients/` |
| Ingestion Analytics | 4 | `/v1/insights/ingestion/` |
| Export | 1 | `/v1/insights/exports/` |

## Documentation

| Document | Description |
|----------|-------------|
| [Copilot Instructions](copilot-instructions-insights-ui.md) | AI agent instructions |
| [Architecture Overview](architecture-overview.md) | System context, tech stack, data flow, routing |
| [Pages & Wireframes](pages-and-wireframes.md) | ASCII wireframes for all 11 pages |
| [API Integration](api-integration.md) | TypeScript types, API modules, TanStack Query hooks |
| [Developer Setup](developer-setup.md) | Prerequisites, quick start, Docker, testing |
| [Subtasks](subtasks.md) | JIRA subtasks for implementation (12 subtasks, 45 story points) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8084` | Insights Service base URL |
| `VITE_AUTH_ENABLED` | `false` | Enable OAuth (demo mode = false) |
| `VITE_POLLING_INTERVAL` | `60000` | Auto-refresh interval (ms) |
| `VITE_DEFAULT_DATE_RANGE_DAYS` | `30` | Default dashboard date range |

## Build & Deploy

```bash
npm run build        # Production build → dist/
npm run preview      # Preview production build
docker build -t cce-insights-ui .
docker run -p 3001:3001 cce-insights-ui
```
