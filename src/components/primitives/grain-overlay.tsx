import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GrainOverlay — renders the SVG film-grain overlay (`.grain-overlay` from
 * globals.css) on its host. Mount once at the top of the warm-mode
 * (marketing/account) layout. The overlay is fixed + pointer-events-none,
 * so it can sit anywhere in the tree.
 *
 * Dashboard (dark mode) intentionally does NOT use grain — the dark
 * aesthetic is sharp, not paper-warm.
 */
export function GrainOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grain-overlay", className)}
    />
  );
}
