// Development fallback — overwritten at container start by docker/entrypoint.sh
// using actual Docker environment variables.
window._env_ = {
  VITE_KEYCLOAK_URL: 'https://keycloak.cce.mdtlabs.org/auth',
  VITE_KEYCLOAK_REALM: 'cce',
  VITE_KEYCLOAK_CLIENT_ID: 'cce-insights-ui',
  VITE_AUTH_ENABLED: '',  // empty → falls through to import.meta.env so .env / .env.local take effect
  VITE_API_BASE_URL: '',
  VITE_POLLING_INTERVAL: '60000',
  VITE_DEFAULT_DATE_RANGE_DAYS: '30',
};
