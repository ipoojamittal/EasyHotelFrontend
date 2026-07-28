"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader } from "@/components/primitives/loader";

/**
 * Root route — redirects by role once auth bootstraps.
 *  - customer → /account
 *  - staff/hotelAdmin/superAdmin → /dashboard
 *  - unauthenticated → stays here (the marketing landing lives at / via the
 *    (marketing) group; this page only handles the auth'd redirect).
 *
 * For unauthenticated users we render the marketing landing content here too
 * (Phase 1 will move it to a dedicated component).
 */
export default function HomePage() {
  const { user, status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      const dest =
        user.role === "customer" ? "/account" : "/dashboard";
      router.replace(dest);
    }
  }, [status, user, router]);

  if (status === "loading") {
    return <Loader label="Loading…" />;
  }

  // Unauthenticated → show the marketing landing (Phase 1 will expand this).
  return <MarketingStub />;
}

/** Phase-0 landing stub — replaced by the full immersive landing in Phase 1. */
function MarketingStub() {
  return (
    <div className="grain-overlay flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <span className="font-display text-lg tracking-tight">
          <span className="text-foreground">hms</span>
          <span className="text-primary">.</span>
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/hotels" className="text-muted-foreground hover:text-foreground">
            Browse stays
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          A modern hotel management platform
        </p>
        <h1 className="font-display text-5xl leading-tight tracking-tight text-foreground sm:text-6xl">
          Run your property.
          <br />
          <span className="text-primary">Book the stay.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          A dual-mode hotel management system — an immersive customer booking
          experience and a precise, keyboard-first operations dashboard.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/hotels"
            className="shine-sweep inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform motion-safe:hover:scale-[1.02]"
          >
            Explore stays
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
