import Keycloak from 'keycloak-js';
import { env } from './env';

const keycloak = new Keycloak({
  url:      env.keycloakUrl,
  realm:    env.keycloakRealm,
  clientId: env.keycloakClientId,
});

export default keycloak;
