import { useEffect } from 'react';
import keycloak from '../lib/keycloak';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const { teacher, isAuthenticated, isLoading, setTeacher, setAccessToken, setLoading, logout } =
    useAuthStore();

  useEffect(() => {
    keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    }).then(async (authenticated) => {
      if (authenticated && keycloak.token) {
        setAccessToken(keycloak.token);
        try {
          const profile = await authApi.provisionProfile();
          setTeacher(profile);
        } catch {
          // Profile provision failed — still mark as loading done
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // Token refresh listener
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        logout();
        keycloak.logout();
      });
    };
  }, []);

  return {
    teacher,
    isAuthenticated,
    isLoading,
    login:  () => keycloak.login(),
    logout: () => { logout(); keycloak.logout({ redirectUri: window.location.origin }); },
  };
}
