"use client";

import * as React from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * useMagnetic — pointer-following "magnetic" effect for an element.
 *
 * Returns a ref + motion values for translate. The element drifts toward
 * the cursor by `strength` (0–1) while hovered, springs back on leave.
 * Disabled entirely under prefers-reduced-motion.
 *
 * Usage:
 *   const { ref, x, y } = useMagnetic(0.3);
 *   <motion.button ref={ref} style={{ x, y }}>…</motion.button>
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.25) {
  const ref = React.useRef<T | null>(null);
  const reduced = useReducedMotion();
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const onMove = React.useCallback(
    (e: PointerEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setPos({
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
      });
    },
    [reduced, strength]
  );

  const onLeave = React.useCallback(() => setPos({ x: 0, y: 0 }), []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [onMove, onLeave]);

  return { ref, x: pos.x, y: pos.y };
}
