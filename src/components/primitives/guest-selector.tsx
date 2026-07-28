"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

/**
 * GuestSelector — a stepper for selecting the number of guests. Min 1,
 * max configurable (default 10). Compact, accessible, no external deps.
 */
export function GuestSelector({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease guests"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className="min-w-[3rem] text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {value} {value === 1 ? "guest" : "guests"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase guests"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
