"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * StepProgress — a horizontal step indicator with a sliding active pill.
 * Used at the top of the booking flow. Each step shows its number + label.
 * Completed steps get a checkmark; the active step gets a filled pill.
 */
export function StepProgress({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // 0-indexed
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? "✓" : i + 1}
                {isActive ? (
                  <motion.div
                    layoutId="step-pill"
                    className="absolute inset-0 rounded-full ring-2 ring-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "font-medium text-foreground"
                    : isComplete
                      ? "text-foreground/80"
                      : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "h-px w-6 transition-colors sm:w-10",
                  isComplete ? "bg-primary/30" : "bg-border"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
