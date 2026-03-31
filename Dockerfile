# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────
FROM caddy:2-alpine

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built assets from Stage 1
COPY --from=build /app/dist /srv

EXPOSE 3001

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
