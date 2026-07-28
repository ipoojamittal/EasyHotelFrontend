"use client";

import * as React from "react";
import { useSpotlight } from "@/lib/animation/use-spotlight";
import { cn } from "@/lib/utils";

/**
 * SpotlightCard — a card with a radial-gradient spotlight that follows
 * the cursor. The spotlight is a CSS radial-gradient driven by
 * `--spot-x` / `--spot-y` / `--spot-o` custom properties (set by
 * useSpotlight). Disabled on touch-primary devices.
 *
 * Depth comes from a hairline border + the spotlight, not a heavy shadow
 * (per the dark-mode surface-lift principle).
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "var(--primary)",
}: {
  children: React.ReactNode;
  className?: string;
  /** CSS color used for the spotlight gradient (default: brand primary). */
  spotlightColor?: string;
}) {
  const { ref, style } = useSpotlight();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={
        {
          ...style,
          "--spotlight-color": spotlightColor,
        } as React.CSSProperties
      }
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card transition-colors",
        className
      )}
    >
      {/* Spotlight layer — sits above the background, below content. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          {
            background:
              "radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--spotlight-color) 14%, transparent), transparent 60%)",
            opacity: "var(--spot-o, 0)",
          } as React.CSSProperties
        }
      />
      <div className="relative">{children}</div>
    </div>
  );
}
