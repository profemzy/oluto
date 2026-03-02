"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { User as OidcUser } from "oidc-client-ts";
import { getUserManager } from "@/app/lib/keycloak";
import { api } from "@/app/lib/api";

interface AuthContextValue {
  user: OidcUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  getAccessToken: () => null,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

function setupTokenProvider() {
  const um = getUserManager();
  api.setTokenProvider(() =>
    um.getUser().then((u) => u?.access_token ?? null)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OidcUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const um = getUserManager();

    // Check for existing session in sessionStorage
    um.getUser()
      .then((existingUser) => {
        if (existingUser && !existingUser.expired) {
          setUser(existingUser);
          setupTokenProvider();
        }
      })
      .catch((err) => {
        console.error("AuthProvider getUser error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Listen for token events
    const onUserLoaded = (loadedUser: OidcUser) => {
      setUser(loadedUser);
      setupTokenProvider();
    };
    const onUserUnloaded = () => {
      setUser(null);
    };

    um.events.addUserLoaded(onUserLoaded);
    um.events.addUserUnloaded(onUserUnloaded);

    return () => {
      um.events.removeUserLoaded(onUserLoaded);
      um.events.removeUserUnloaded(onUserUnloaded);
    };
  }, []);

  const login = useCallback(() => {
    getUserManager().signinRedirect().catch((err) => {
      console.error("signinRedirect failed:", err);
      // Fallback: redirect manually to Keycloak auth endpoint
      const um = getUserManager();
      const origin = window.location.origin;
      const url = `${um.settings.authority}/protocol/openid-connect/auth?client_id=${um.settings.client_id}&redirect_uri=${encodeURIComponent(origin + "/auth/callback")}&response_type=code&scope=openid+profile+email`;
      window.location.href = url;
    });
  }, []);

  const logout = useCallback(() => {
    getUserManager().signoutRedirect().catch((err) => {
      console.error("signoutRedirect failed:", err);
    });
  }, []);

  const getAccessToken = useCallback(() => {
    return user?.access_token ?? null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.expired,
        isLoading,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
