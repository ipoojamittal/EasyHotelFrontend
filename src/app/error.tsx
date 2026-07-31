"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary — catches unhandled errors in any route
 * segment and offers a recovery path. Must be a Client Component.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for now; a real observability hook goes here.
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-2xl tracking-tight">Something went wrong</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or head back home.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground/60">Ref: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="ghost">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
