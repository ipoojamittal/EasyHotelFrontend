"use client";

import * as React from "react";

/**
 * useReducedMotion — SSR-safe hook mirroring prefers-reduced-motion.
 *
 * Motion's own `useReducedMotion` is fine, but we want a single source of
 * truth that also works outside <MotionConfig> (e.g. in plain CSS-driven
 * components). Returns `true` when the user has requested reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
