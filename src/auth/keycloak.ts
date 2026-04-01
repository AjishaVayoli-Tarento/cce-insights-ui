import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const TOKEN_REFRESH_INTERVAL = 30_000;
const TOKEN_MIN_VALIDITY_SECONDS = 30;

export async function initKeycloak(): Promise<void> {
  const authenticated = await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
  });

  if (!authenticated) {
    keycloak.login();
    return;
  }

  // Auto-refresh token before expiry
  setInterval(() => {
    keycloak.updateToken(TOKEN_MIN_VALIDITY_SECONDS).catch(() => {
      keycloak.login();
    });
  }, TOKEN_REFRESH_INTERVAL);
}
