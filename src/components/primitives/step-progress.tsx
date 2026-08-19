"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
    <ol
      className={cn(
        "flex w-full items-start justify-center gap-0",
        className
      )}
    >
      {steps.map((label, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        return (
          <li key={label} className="group relative flex flex-1 items-center">
            <div className="z-10 flex flex-1 flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10"
                    : isComplete
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
                {isActive ? (
                  <motion.div
                    layoutId="step-pill"
                    className="absolute inset-0 rounded-full ring-2 ring-primary/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-sm transition-colors duration-300",
                  isActive
                    ? "font-semibold text-foreground"
                    : isComplete
                      ? "font-medium text-foreground/80"
                      : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "absolute top-5 left-1/2 h-1 w-[calc(100%-2.5rem)] -translate-y-1/2 transition-colors duration-300",
                  isComplete ? "bg-primary" : "bg-muted"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
