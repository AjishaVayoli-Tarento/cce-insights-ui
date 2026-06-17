import { createContext, useContext, useCallback, type ReactNode } from 'react';
import keycloak from './keycloak';
import { getEnv } from '../env';

interface AuthContextValue {
  authenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authEnabled = getEnv('VITE_AUTH_ENABLED') === 'true';

  const logout = useCallback(() => {
    if (authEnabled) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  }, [authEnabled]);

  return (
    <AuthContext.Provider value={{
      authenticated: authEnabled ? (keycloak.authenticated ?? false) : true,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
