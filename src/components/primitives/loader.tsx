"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Loader — a calm, minimal full-area loader used by route guards and Suspense
 * fallbacks while the auth/bootstrap state resolves. Restrained: a single
 * pulsing mark + optional label. No spinners (per the quiet-luxury principle).
 */
export function Loader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
        <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
      </div>
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}
