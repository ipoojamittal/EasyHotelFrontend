"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import type { Role } from "@/types/api";
import { Loader } from "@/components/primitives/loader";

/**
 * AuthGuard — client-side route protection.
 *
 * The JWT lives in sessionStorage (not readable by the server proxy), so the
 * real enforcement happens here in the client. Wrap any route that requires
 * authentication. Shows a loader while bootstrapping, redirects to /login
 * (with the current path as ?redirect=) when unauthenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathRef = React.useRef<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      pathRef.current = window.location.pathname + window.location.search;
    }
  }, []);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const current = pathRef.current || "/account";
      const loginUrl = `/login?redirect=${encodeURIComponent(current)}`;
      router.replace(loginUrl);
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loader label="Checking your session…" />;
  }
  if (status === "unauthenticated") {
    // Brief state before the redirect effect fires.
    return <Loader label="Redirecting to sign in…" />;
  }
  return <>{children}</>;
}

/**
 * RoleGuard — restrict a route to a set of roles. Must be used inside an
 * AuthGuard (so the user is already authenticated). Renders a polished
 * "wrong role" state if the user's role isn't permitted, rather than crashing.
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();

  if (status === "loading") {
    return <Loader label="Loading…" />;
  }
  if (!user) {
    return <Loader label="Redirecting to sign in…" />;
  }
  if (!allow.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
        <h2 className="font-display text-2xl">Not available for your account</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This area is for {allow.join(", ")} accounts. You are signed in as{" "}
          <span className="font-medium text-foreground">{user.role}</span>.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
