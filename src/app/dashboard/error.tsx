"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Dashboard error boundary — isolates crashes within the dashboard
 * shell so the sidebar/layout stays intact while the page content
 * shows a recovery prompt.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-xl tracking-tight">This page hit an error</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Try reloading the page, or head back to the dashboard.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground/60">Ref: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} size="sm">Try again</Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
