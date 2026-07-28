"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * SessionExpiryWatcher — proactive session validation.
 *
 * The backend issues JWTs without refresh tokens, so we can't extend a
 * session. Instead we re-validate on triggers that suggest the user is
 * still actively present but the tab may have been backgrounded long
 * enough for the JWT to expire:
 *
 *  - `visibilitychange` → tab refocused
 *  - `window.focus` → window refocused
 *
 * On either event we call /api/auth/status; a 401 clears the token and
 * the AuthProvider flips to `unauthenticated`, which AuthGuard turns
 * into a redirect to /login. A success just re-hydrates the user.
 *
 * Mounted once inside AuthProvider so it's always active for signed-in
 * users. Respects prefers-reduced-motion only for UI, not for logic.
 */
export function SessionExpiryWatcher() {
  const { status, refresh, logout } = useAuth();
  const validating = React.useRef(false);

  React.useEffect(() => {
    if (status !== "authenticated") return;

    const revalidate = async () => {
      if (validating.current) return;
      validating.current = true;
      try {
        await refresh();
      } catch {
        // 401 / network — the apiFetch 401 handler already cleared the
        // token; ensure AuthProvider state matches.
        logout();
      } finally {
        validating.current = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") revalidate();
    };
    const onFocus = () => revalidate();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [status, refresh, logout]);

  return null;
}
