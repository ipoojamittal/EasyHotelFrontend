import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — content-matched loading placeholder. Uses the `.shimmer`
 * utility class from globals.css for a subtle sweep (not a pulse).
 * Match the dimensions of the real content to avoid layout shift.
 */
export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer rounded-md", className)}
      aria-hidden="true"
      {...rest}
    />
  );
}
