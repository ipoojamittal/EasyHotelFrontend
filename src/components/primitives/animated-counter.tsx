"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";

/**
 * AnimatedCounter — counts up from 0 (or `from`) to `value` when it
 * scrolls into view. Uses a spring for a premium, non-linear feel.
 * Renders tabular numerals so the width doesn't jitter.
 *
 * Pass `format` to control the rendered string (e.g. currency, thousands).
 */
export function AnimatedCounter({
  value,
  from = 0,
  format = (n) => Math.round(n).toLocaleString(),
  className,
  duration,
}: {
  value: number;
  from?: number;
  format?: (n: number) => string;
  className?: string;
  /** Override the spring stiffness (default 120 = ~1.2s settle). */
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, {
    stiffness: duration ?? 120,
    damping: 28,
    mass: 1,
  });
  const display = useTransform(spring, (latest) => format(latest));

  React.useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  // Reduced motion: just render the final value, no animation.
  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {format(value)}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className} style={{ display }}>
    </motion.span>
  );
}
