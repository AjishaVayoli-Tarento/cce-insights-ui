import Keycloak from 'keycloak-js';

/**
 * Keycloak OIDC integration for the Insights UI.
 *
 * The dashboard's API calls go through the API gateway (`/v1/insights/**`), which requires a
 * valid Bearer token (issuer = the public Keycloak, audience = gateway-service, role
 * INSIGHTS_READ / COMPLIANCE_READ). This module performs the Authorization-Code + PKCE login
 * and exposes the live access token to the API client.
 *
 * Config is build-time (VITE_*). When VITE_AUTH_ENABLED !== 'true' the app runs unauthenticated
 * (local dev with the Vite proxy / direct insights-service).
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

let keycloak: Keycloak | undefined;

export async function initAuth(): Promise<void> {
  if (!authEnabled) return;

  // The UI, Keycloak (/auth) and the gateway (/v1) are served on the SAME domain, so by
  // default derive the Keycloak URL from the current origin (e.g. https://cce.moh.gov.rw/auth).
  // This keeps the built image environment-agnostic — the same image works on UAT and PROD.
  // VITE_KEYCLOAK_URL is only needed as an override (e.g. local dev against a remote Keycloak).
  const keycloakUrl =
    import.meta.env.VITE_KEYCLOAK_URL || `${window.location.origin}/auth`;

  keycloak = new Keycloak({
    url: keycloakUrl,
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'cce',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'cce-insights-ui',
  });

  await keycloak.init({
    onLoad: 'login-required', // redirect unauthenticated users to the Keycloak login
    pkceMethod: 'S256',
    checkLoginIframe: false,
    // Return to wherever the user was after login.
    redirectUri: window.location.href,
  });

  // Proactively refresh the access token before it expires; fall back to a fresh login.
  setInterval(() => {
    keycloak?.updateToken(70).catch(() => keycloak?.login());
  }, 60_000);
}

/** Current access token (undefined when auth is disabled or not yet initialised). */
export function getToken(): string | undefined {
  return keycloak?.token;
}

export function getUsername(): string | undefined {
  return keycloak?.tokenParsed?.preferred_username as string | undefined;
}

export function logout(): void {
  keycloak?.logout({ redirectUri: window.location.origin + '/insights' });
}
