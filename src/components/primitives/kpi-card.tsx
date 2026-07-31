"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { Skeleton } from "./skeleton";
import type { LucideIcon } from "lucide-react";

/**
 * KpiCard — a single KPI tile for the dashboard bento grid. Shows an
 * icon, label, and an animated value (count-up on mount). Optional
 * hint/sublabel below.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  format,
  hint,
  className,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (n: number) => string;
  hint?: string;
  className?: string;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p className="mt-3 font-display text-3xl tracking-tight text-foreground">
          <AnimatedCounter value={value} format={format} />
        </p>
      )}
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
