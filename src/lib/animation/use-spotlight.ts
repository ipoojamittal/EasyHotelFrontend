"use client";

import * as React from "react";

/**
 * useSpotlight — radial-gradient spotlight that follows the cursor over a
 * card. Returns a ref + a CSS `--spot-x` / `--spot-y` / `--spot-o` set of
 * custom properties to wire into the element's style.
 *
 * The element should use a background like:
 *   radial-gradient(220px circle at var(--spot-x) var(--spot-y),
 *     color-mix(in oklab, var(--primary) 12%, transparent), transparent 60%)
 *
 * Disabled when the pointer is coarse (touch) — no hover on touch.
 */
export function useSpotlight() {
  const ref = React.useRef<HTMLElement | null>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Skip on touch-primary devices.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setStyle({
        "--spot-x": `${x}px`,
        "--spot-y": `${y}px`,
        "--spot-o": "1",
      } as React.CSSProperties);
    };
    const onLeave = () =>
      setStyle({ "--spot-o": "0" } as React.CSSProperties);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return { ref, style };
}
