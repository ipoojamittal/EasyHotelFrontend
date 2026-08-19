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
 * Styling: react-day-picker v10 ships a base CSS; we override via the
 * `classNames` prop to match our warm theme tokens. The component is
 * rendered inside a shadcn Popover by the caller.
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
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      numberOfMonths={1}
      disabled={[
        { before: new Date() },
        ...(disabled ? [disabled] : []),
      ]}
      classNames={{
        root: cn("p-3", className),
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
        caption_label: "text-foreground",
        nav: "flex items-center gap-1",
        button_previous: "absolute left-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        button_next: "absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 text-xs font-normal",
        week: "flex w-full mt-2",
        day: "p-0 size-9 text-sm tabular-nums",
        day_button: cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        range_start: "bg-primary/15 rounded-l-md",
        range_end: "bg-primary/15 rounded-r-md",
        range_middle: "bg-primary/8 rounded-none",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "border border-border",
        disabled: "text-muted-foreground/40 opacity-50",
        outside: "text-muted-foreground/40",
        hidden: "invisible",
      }}
    />
  );
}
