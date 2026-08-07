"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiClient, ApiError } from "./api-client";
import { tokenStore } from "./token-store";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  departmentId?: string | null;
  isEmailVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, there's no access token in memory (a full page reload
  // wipes it by design — see token-store.ts) — try to silently recover a
  // session from the httpOnly refresh cookie before deciding the user is
  // logged out.
  useEffect(() => {
    (async () => {
      const refreshed = await apiClient.refresh();
      if (refreshed) {
        try {
          const res = await apiClient.get<{ data: AuthUser }>("/auth/me");
          setUser(res.data);
        } catch {
          tokenStore.set(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ data: { accessToken: string; user: AuthUser } }>(
      "/auth/login",
      { email, password },
      { skipAuthRetry: true }
    );
    tokenStore.set(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Best-effort — clear local state regardless of network/API errors.
    }
    tokenStore.set(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
