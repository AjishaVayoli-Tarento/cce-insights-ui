#!/bin/sh
# Generate /srv/env-config.js at container start, injecting runtime Docker env vars.
# This overwrites the build-time placeholder so the React app picks up the correct
# Keycloak URL, realm, and auth flag without needing a rebuild per environment.
cat > /srv/env-config.js << EOF
window._env_ = {
  "VITE_KEYCLOAK_URL": "${VITE_KEYCLOAK_URL:-https://keycloak.cce.mdtlabs.org/auth}",
  "VITE_KEYCLOAK_REALM": "${VITE_KEYCLOAK_REALM:-cce}",
  "VITE_KEYCLOAK_CLIENT_ID": "${VITE_KEYCLOAK_CLIENT_ID:-cce-insights-ui}",
  "VITE_AUTH_ENABLED": "${VITE_AUTH_ENABLED:-false}",
  "VITE_API_BASE_URL": "${VITE_API_BASE_URL:-}",
  "VITE_POLLING_INTERVAL": "${VITE_POLLING_INTERVAL:-60000}",
  "VITE_DEFAULT_DATE_RANGE_DAYS": "${VITE_DEFAULT_DATE_RANGE_DAYS:-30}"
};
EOF
exec caddy run --config /etc/caddy/Caddyfile
