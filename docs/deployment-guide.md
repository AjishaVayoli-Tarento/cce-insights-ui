# Deployment Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Docker | 20.10+ |
| Docker Compose | 2.x |
| Node.js (dev only) | 20 LTS |
| cce-insights-service | Running on `deploy-scripts_cce-net` network |

## Architecture

```
Browser → :3001 → Caddy (cce-insights-ui container)
                    ├── static assets (React SPA)
                    └── /v1/insights/* → proxy → cce-insights-service:8084
```

The UI container runs Caddy which:
1. Serves the built React SPA for all browser routes
2. Proxies `/v1/insights/*` API requests to the insights-service container
3. No gateway required — direct service-to-service communication on the Docker network

## Quick Deploy (Docker Compose)

```bash
# From the project root
docker compose up -d --build
```

This will:
- Build a multi-stage Docker image (node:20-alpine → caddy:2-alpine)
- Join the `deploy-scripts_cce-net` network where `cce-insights-service` is running
- Expose the UI on http://localhost:3001

## Verify

```bash
# Check container is running
docker ps | grep cce-insights-ui

# Check health
curl -s http://localhost:3001/ | head -5

# Verify API proxy is working
curl -s http://localhost:3001/v1/insights/events/summary | head -c 200
```

## Stop

```bash
docker compose down
```

## Rebuild After Code Changes

```bash
docker compose up -d --build --force-recreate
```

## Local Development (without Docker)

```bash
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8084 for local dev
npm install
npm run dev          # http://localhost:3001
```

In dev mode, Vite's dev server proxies `/v1/insights/*` to `localhost:8084` (configured in `vite.config.ts`).

## Configuration

### Environment Variables (build-time)

Set in `.env` before `npm run build` or `docker compose build`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | _(empty)_ | API base URL. Empty = relative (Caddy proxy). Set to `http://localhost:8084` for local dev |
| `VITE_AUTH_ENABLED` | `false` | Enable OAuth bearer token |
| `VITE_POLLING_INTERVAL` | `60000` | Dashboard auto-refresh interval (ms) |
| `VITE_DEFAULT_DATE_RANGE_DAYS` | `30` | Default date range filter |

### Caddy Configuration

The `Caddyfile` configures:
- Listening on port 3001
- Gzip/zstd compression via `encode`
- Aggressive caching for `/assets/` (hashed filenames)
- API reverse proxy to `cce-insights-service:8084`
- SPA fallback (`try_files` → `index.html`)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### Docker Network

The compose file connects to the external `deploy-scripts_cce-net` network. If your insights-service is on a different network, update `docker-compose.yml`:

```yaml
networks:
  cce-net:
    external: true
    name: your_network_name
```

And update the upstream hostname in `Caddyfile` if the container name differs:

```caddyfile
reverse_proxy /v1/insights/* your-insights-container:8084
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 502 Bad Gateway on API calls | Ensure `cce-insights-service` is running and on the same Docker network |
| Page loads but API errors | Check `docker logs cce-insights-ui` for Caddy proxy errors |
| Blank page | Verify `dist/` was built correctly — rebuild with `docker compose up --build` |
| Container exits immediately | Check `docker logs cce-insights-ui` — likely Caddyfile syntax error |
