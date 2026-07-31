"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/api";

/**
 * StatusStepper — a horizontal stepper showing the booking lifecycle:
 * pending → confirmed → checked-in → checked-out.
 * Cancelled and no-show are terminal off-path states shown as a badge
 * instead of advancing the stepper.
 *
 * Each step is clickable if `onAdvance` is provided and the step is
 * reachable from the current status.
 */

const FORWARD_PATH: BookingStatus[] = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
];

const STEP_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

export function StatusStepper({
  current,
  onAdvance,
  disabled,
}: {
  current: BookingStatus;
  onAdvance?: (next: BookingStatus) => void;
  disabled?: boolean;
}) {
  // Terminal off-path states
  if (current === "cancelled" || current === "no-show") {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        {STEP_LABELS[current]}
      </div>
    );
  }

  const currentIndex = FORWARD_PATH.indexOf(current);

  return (
    <div className="flex items-center gap-1">
      {FORWARD_PATH.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const isClickable =
          onAdvance && !disabled && isCurrent && i < FORWARD_PATH.length - 1;

        return (
          <React.Fragment key={step}>
            {i > 0 ? (
              <div
                className={cn(
                  "h-px w-6",
                  i <= currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onAdvance?.(FORWARD_PATH[i + 1])}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isCurrent && "text-primary",
                isComplete && "text-muted-foreground",
                isFuture && "text-muted-foreground/50",
                isClickable && "cursor-pointer hover:bg-primary/10",
                !isClickable && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "border border-primary bg-primary/10",
                  isFuture && "border border-border"
                )}
              >
                {isComplete ? "✓" : i + 1}
              </span>
              {STEP_LABELS[step]}
              {isCurrent ? (
                <motion.span
                  layoutId="status-stepper-active"
                  className="absolute -bottom-px left-0 right-0 h-px bg-primary"
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                />
              ) : null}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
