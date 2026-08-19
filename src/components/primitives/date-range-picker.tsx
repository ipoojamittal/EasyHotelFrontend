"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

/**
 * DateRangePicker — a calendar for selecting a check-in → check-out
 * range. Wraps react-day-picker v10 in range mode. Past dates are
 * disabled. The component is controlled (selected + onSelect).
 *
 * Styling: react-day-picker v10 ships a base CSS (style.css) that uses
 * CSS variables (--rdp-*). We override those variables to match our
 * theme tokens instead of replacing the classNames, which preserves
 * the range selection gradients and visual feedback.
 */
export function DateRangePicker({
  selected,
  onSelect,
  disabled,
  className,
}: {
  selected: { from: Date | undefined; to?: Date | undefined } | undefined;
  onSelect: (range: { from: Date | undefined; to?: Date | undefined } | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("rdp-root", className)}
      style={
        {
          // Map our theme tokens to react-day-picker CSS variables
          "--rdp-accent-color": "var(--primary)",
          "--rdp-accent-background-color": "var(--muted)",
          "--rdp-day-height": "2.5rem",
          "--rdp-day-width": "2.5rem",
          "--rdp-day_button-height": "2.25rem",
          "--rdp-day_button-width": "2.25rem",
          "--rdp-day_button-border-radius": "0.5rem",
        } as React.CSSProperties
      }
    >
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        numberOfMonths={1}
        disabled={[
          { before: new Date() },
          ...(disabled ? [disabled] : []),
        ]}
      />
    </div>
  );
}
