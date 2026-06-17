import Keycloak from 'keycloak-js';
import { getEnv } from '../env';

const keycloak = new Keycloak({
  url: getEnv('VITE_KEYCLOAK_URL', 'https://keycloak.cce.mdtlabs.org/auth'),
  realm: getEnv('VITE_KEYCLOAK_REALM', 'cce'),
  clientId: getEnv('VITE_KEYCLOAK_CLIENT_ID', 'cce-insights-ui'),
});

export default keycloak;
