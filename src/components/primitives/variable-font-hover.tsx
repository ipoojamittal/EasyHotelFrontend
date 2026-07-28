"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VariableFontHover — animates a variable font's axis on hover.
 *
 * Designed for Fraunces (warm-mode display) which exposes `opsz`, `wght`,
 * and `SOFT` axes. On hover the weight ramps up + softness eases, giving
 * an editorial "the letterforms warm up" effect. Falls back to a static
 * weight transition under prefers-reduced-motion (no axis animation).
 *
 * Usage:
 *   <VariableFontHover axis="wght" from={400} to={600}>
 *     The Marlowe
 *   </VariableFontHover>
 */
export function VariableFontHover({
  children,
  axis = "wght",
  from = 400,
  to = 600,
  className,
  duration = 0.4,
}: {
  children: React.ReactNode;
  axis?: "wght" | "opsz" | "SOFT";
  from?: number;
  to?: number;
  className?: string;
  duration?: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  const value = hovered ? to : from;

  return (
    <span
      className={cn("transition-[font-variation-settings]", className)}
      style={{
        fontVariationSettings: `"${axis}" ${value}`,
        transitionDuration: `${duration}s`,
        transitionTimingFunction: "cubic-bezier(0.2, 0, 0.38, 0.9)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </span>
  );
}
