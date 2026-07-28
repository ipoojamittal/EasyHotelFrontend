"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useScrollProgress } from "@/lib/animation/use-scroll";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * ScrollProgressBar — a thin fixed bar at the top of the viewport that
 * fills as the user scrolls down. Spring-driven for a premium feel.
 * Hidden under reduced motion (the CSS `.scroll-progress` utility is the
 * reduced-motion fallback if a non-JS bar is preferred).
 */
export function ScrollProgressBar({ className }: { className?: string }) {
  const progress = useScrollProgress();
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-px origin-left bg-primary",
        className
      )}
      style={{ scaleX: progress }}
      aria-hidden="true"
    />
  );
}
