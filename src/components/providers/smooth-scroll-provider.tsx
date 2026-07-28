"use client";

import * as React from "react";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";

/**
 * SmoothScrollProvider — Lenis inertial smooth scroll for the customer-
 * facing site (marketing + account). The dashboard intentionally keeps
 * native scroll for precision/density.
 *
 * Config: lerp 0.1, duration 1.2, smoothWheel, syncTouch on touch.
 * Disabled entirely under prefers-reduced-motion (native scroll instead).
 *
 * Uses `root` so Lenis wraps the document (not a nested div) — preserves
 * sticky positioning, anchor links, and keyboard scroll.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    // Reduced motion: native scroll, no Lenis.
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
