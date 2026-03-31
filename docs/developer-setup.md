# Developer Setup & Configuration

> **CCE Insights UI** — Local development guide  
> **Version**: 1.0.0 | **Last Updated**: 2026-03-31

---

## 1. Prerequisites

| Tool | Version | Required | Purpose |
|---|---|---|---|
| **Node.js** | 20 LTS+ | Yes | JavaScript runtime |
| **npm** | 10+ | Yes | Package manager (bundled with Node) |
| **Git** | 2.x | Yes | Version control |
| **Docker** | 24+ | Recommended | Run backend dependencies |
| **Docker Compose** | 2.x | Recommended | Orchestrate infrastructure |

### Backend Dependencies

The Insights UI requires the **CCE Insights Service** running and connected to a populated PostgreSQL database. The full stack setup:

```
PostgreSQL (cce_collector) ← Collector Service + Compliance Service (write data)
                           ← Insights Service (read-only, port 8084)
                           ← Insights UI (this app, port 3001)
```

---

## 2. Quick Start

### 2.1 Start Backend Infrastructure

```bash
# Option A: Start everything via the Collector Service compose
cd /path/to/cce-collector-service
docker compose up -d

# Start the Insights Service
cd /path/to/cce-insights-service
./gradlew bootRun
# Verify: curl http://localhost:8084/actuator/health

# Option B: If Insights Service is also containerized
cd /path/to/cce-insights-service
docker compose up -d
```

> **Seed data:** The Insights UI needs populated tables to display meaningful analytics. Run the demo event submission workflow (via the Emitter Adaptor or Postman collection) to seed patient data, protocol enrollments, and clinical events.

### 2.2 Clone & Install

```bash
git clone <repository-url>
cd cce-insights-ui

npm install
```

### 2.3 Configure Environment

```bash
cp .env.example .env
```

Default `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8084
VITE_AUTH_ENABLED=false
VITE_POLLING_INTERVAL=60000
VITE_DEFAULT_DATE_RANGE_DAYS=30
```

### 2.4 Start Development Server

```bash
npm run dev
```

Open http://localhost:3001 in your browser.

### 2.5 Verify Connection

The dashboard should load metrics from the Insights Service. If you see "Cannot reach Insights Service" errors:

1. Check that the Insights Service is running: `curl http://localhost:8084/actuator/health`
2. Check that the database has data: `curl http://localhost:8084/v1/insights/events/summary`
3. Check CORS: if using direct connection (not Vite proxy), ensure the Insights Service allows `http://localhost:3001`

---

## 3. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8084` | Insights Service URL. Set to empty string `""` when using Vite proxy. |
| `VITE_AUTH_ENABLED` | `false` | Enable OAuth token injection. `false` for demo mode. |
| `VITE_POLLING_INTERVAL` | `60000` | Auto-refresh interval in milliseconds. `0` to disable. |
| `VITE_DEFAULT_DATE_RANGE_DAYS` | `30` | Default date range for dashboard (days back from today). |

---

## 4. Project Initialization (from scratch)

If scaffolding a new project:

```bash
npm create vite@latest cce-insights-ui -- --template react-ts
cd cce-insights-ui

# Core dependencies
npm install react-router-dom @tanstack/react-query recharts date-fns @heroicons/react

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom msw
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    proxy: {
      '/v1/insights': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
    },
  },
});
```

### Tailwind Setup

```css
/* src/index.css */
@import "tailwindcss";
```

---

## 5. Project Structure

```
cce-insights-ui/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # Typed API client (10 modules)
│   ├── components/
│   │   ├── layout/             # AppLayout, Sidebar, Header, FilterBar
│   │   ├── common/             # MetricCard, Badges, DataTable, Pagination
│   │   ├── charts/             # 10 Recharts wrapper components
│   │   └── patient/            # Timeline, Tracking, Steps, Deviations
│   ├── pages/                  # 11 page components
│   ├── hooks/                  # 10 TanStack Query hooks
│   ├── context/                # FilterContext (global date range + facility)
│   ├── utils/                  # dates, colors, formatters, compliance, pagination
│   ├── config.ts               # Constants and defaults
│   ├── App.tsx                 # Router + providers
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind imports
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── Dockerfile
├── Caddyfile
└── docker-compose.yml
```

---

## 6. npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server on port 3001 |
| `build` | `tsc -b && vite build` | Type-check + production build |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest` | Run tests in watch mode |
| `test:run` | `vitest run` | Run tests once (CI) |
| `lint` | `eslint .` | Lint all files |
| `format` | `prettier --write .` | Format all files |

---

## 7. Testing Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Mock Service Worker (MSW)

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/v1/insights/events/summary', () => {
    return HttpResponse.json({
      data: {
        totalEvents: 12480,
        processingStatusBreakdown: { matched: 9820, zeroMatch: 2540, duplicate: 120 },
        byResourceType: [{ resourceType: 'Encounter', count: 4200 }],
        byFacility: [{ facilityId: '0002', count: 3200 }],
        bySource: [{ source: 'rhie-mediator', count: 8400 }],
      },
    });
  }),
  // ... add handlers for all endpoints
];
```

### Test File Location Convention

```
src/
├── api/
│   └── __tests__/
│       └── client.test.ts
├── components/
│   └── common/
│       └── __tests__/
│           └── StateBadge.test.tsx
├── hooks/
│   └── __tests__/
│       └── useEventVolume.test.ts
├── pages/
│   └── __tests__/
│       └── DashboardPage.test.tsx
└── utils/
    └── __tests__/
        ├── colors.test.ts
        ├── dates.test.ts
        └── compliance.test.ts
```

---

## 8. Docker Build

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 3001
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
```

### Caddyfile

```caddyfile
:3001 {
    root * /srv
    encode zstd gzip

    reverse_proxy /v1/insights/* cce-insights-service:8084

    try_files {path} /index.html
    file_server

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  insights-ui:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - insights-service
    environment:
      - XDG_DATA_HOME=/data

  insights-service:
    image: cce-insights-service:latest
    ports:
      - "8084:8084"
    environment:
      - DB_HOST=cce-db
      - DB_PORT=5432
      - DB_NAME=cce_collector
      - DB_USERNAME=cce_user
      - DB_PASSWORD=cce_pass
```

### Build & Run

```bash
docker build -t cce-insights-ui:latest .
docker run -p 3001:3001 cce-insights-ui:latest
```

---

## 9. Demo Workflow

Step-by-step sequence for a live demo:

1. **Start infrastructure**: `docker compose up -d` (PostgreSQL + Kafka)
2. **Start Collector Service**: `./gradlew bootRun` (port 8081)
3. **Start Compliance Service**: `./gradlew bootRun` (port 8080)
4. **Load protocol definitions**: Run the protocol loading Postman collection
5. **Submit clinical events**: Use the Emitter Adaptor or Postman to submit patient events
6. **Wait for compliance processing**: Events flow through Kafka → Compliance Service → PostgreSQL
7. **Start Insights Service**: `./gradlew bootRun` (port 8084)
8. **Start Insights UI**: `npm run dev` (port 3001)
9. **Open dashboard**: http://localhost:3001
10. **Navigate**: Dashboard → Compliance → Protocol Analytics → Deviations → Events → Facilities → Ingestion

### Key Demo Scenarios

| Scenario | Navigation |
|----------|------------|
| Protocol compliance overview | `/compliance` → select protocol |
| Step-level performance bottleneck | `/compliance/protocols/{id}` → step analytics + funnel |
| Patient at-risk identification | `/compliance/patients` → filter by `non_compliant` |
| Individual patient journey | `/compliance/patients/{id}` → timeline + events |
| Deviation trend analysis | `/deviations` → trends chart + by-action table |
| Event volume by source | `/events` → By Source tab |
| Source system duplication | `/events/source-comparison` → select two sources |
| Facility performance comparison | `/facilities` → ranking chart |
| Ingestion health check | `/ingestion` → funnel + rejection reasons |
| Data export | `/exports` → configure + download |
