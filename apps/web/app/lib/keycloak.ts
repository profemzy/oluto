import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const KEYCLOAK_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "oluto";
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "oluto-web";

export const OIDC_AUTHORITY = `${KEYCLOAK_URL}/realms/${REALM}`;

let userManagerInstance: UserManager | null = null;

export function getUserManager(): UserManager {
  if (!userManagerInstance) {
    userManagerInstance = new UserManager({
      authority: OIDC_AUTHORITY,
      client_id: CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      post_logout_redirect_uri: window.location.origin,
      scope: "openid profile email",
      response_type: "code",
      automaticSilentRenew: true,
      userStore: new WebStorageStateStore({ store: sessionStorage }),
    });
  }
  return userManagerInstance;
}

export function getKeycloakRegistrationUrl(): string {
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/auth/callback`
  );
  return `${OIDC_AUTHORITY}/protocol/openid-connect/registrations?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email`;
}

export function getKeycloakPasswordResetUrl(): string {
  return `${OIDC_AUTHORITY}/login-actions/reset-credentials?client_id=${CLIENT_ID}`;
}
