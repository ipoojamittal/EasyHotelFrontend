"use client";

import * as React from "react";
import { authApi } from "@/lib/api/auth";
import { getToken, setToken } from "@/lib/api/apiFetch";
import { SessionExpiryWatcher } from "@/components/auth/session-expiry-watcher";
import type { AuthUser, User } from "@/types/api";

/**
 * AuthProvider — owns the JWT (in-memory + sessionStorage) and the current
 * user, working around the backend's lack of refresh tokens.
 *
 * - On mount: read token from sessionStorage → GET /api/auth/status to
 *   validate + hydrate. On 401, clear + redirect to /login.
 * - login()/register(): set the token + user.
 * - logout(): clear token + user, push to /login.
 * - Components read via useAuth(); route guards use useAuth() too.
 */

interface AuthContextValue {
  user: AuthUser | null;
  /** Full user profile (lazy-loaded via /api/users/me on demand). */
  profile: User | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<string>;
  logout: () => void;
  /** Re-fetch /api/auth/status — used after profile changes. */
  refresh: () => Promise<void>;
  setProfile: (profile: User | null) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy-init token from sessionStorage on the client so we don't need a
  // synchronous setState in the bootstrap effect. Server renders with null.
  const [token, setTokenState] = React.useState<string | null>(() =>
    typeof window !== "undefined" ? getToken() : null
  );
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [profile, setProfile] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  // Bootstrap: validate any persisted token on mount. This synchronizes
  // React state with an external system (sessionStorage + the backend auth
  // endpoint), which is the canonical use case for effects. All setState
  // calls here are in async callbacks (promise resolution), not in the
  // effect body, to avoid cascading renders.
  React.useEffect(() => {
    let cancelled = false;
    if (!token) {
      // No token → anonymous. Deferred to a microtask so we don't call
      // setState synchronously in the effect body.
      queueMicrotask(() => {
        if (!cancelled) setStatus("unauthenticated");
      });
      return;
    }
    authApi
      .status()
      .then((res) => {
        if (cancelled) return;
        setUser({
          id: res.user.id,
          email: res.user.email,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          role: res.user.role,
          hotelId: res.user.hotelId,
        });
        setProfile(res.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        // 401 or network — token is invalid; clear and treat as anonymous.
        setToken(null);
        setTokenState(null);
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const register = React.useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => {
      const res = await authApi.register(data);
      return res.userId;
    },
    []
  );

  const logout = React.useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    setProfile(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined") {
      // Soft redirect; the proxy/layout will handle routing.
      window.location.assign("/login");
    }
  }, []);

  const refresh = React.useCallback(async () => {
    const res = await authApi.status();
    setUser({
      id: res.user.id,
      email: res.user.email,
      firstName: res.user.firstName,
      lastName: res.user.lastName,
      role: res.user.role,
      hotelId: res.user.hotelId,
    });
    setProfile(res.user);
    setStatus("authenticated");
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      token,
      status,
      login,
      register,
      logout,
      refresh,
      setProfile,
    }),
    [user, profile, token, status, login, register, logout, refresh]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiryWatcher />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
