"use client";

import * as React from "react";
import { useReducedMotion } from "./use-reduced-motion";

export interface KineticTextOptions {
  /** Animate per-word (default) or per-character. */
  split?: "word" | "char";
  /** Stagger between segments (seconds). */
  stagger?: number;
  /** Delay before the first segment animates (seconds). */
  delay?: number;
}

/**
 * useKineticText — splits a string into segments for kinetic reveal.
 *
 * Returns the segments + a per-segment variant set, respecting
 * prefers-reduced-motion (no transform, just opacity fade).
 */
export function useKineticText(
  text: string,
  { split = "word", stagger = 0.06, delay = 0 }: KineticTextOptions = {}
) {
  const reduced = useReducedMotion();
  const segments = React.useMemo(() => {
    if (split === "char") return Array.from(text);
    return text.split(" ");
  }, [text, split]);

  const container = React.useMemo(
    () => ({
      hidden: {},
      show: {
        transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay },
      },
    }),
    [reduced, stagger, delay]
  );

  const segment = React.useMemo(
    () => ({
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: "0.6em" },
      show: reduced
        ? { opacity: 1, transition: { duration: 0.2 } }
        : { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.15, 1] as const } },
    }),
    [reduced]
  );

  return { segments, container, segment };
}
