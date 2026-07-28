"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * RippleButton — a button that spawns a radial ripple from the click
 * point. The ripple is a transient motion.span per click (no persistent
 * DOM nodes). Falls back to a normal button under reduced motion.
 */
export function RippleButton({
  children,
  className,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = React.useState<
    { id: number; x: number; y: number }[]
  >([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!reduced) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
      window.setTimeout(
        () => setRipples((r) => r.filter((rip) => rip.id !== id)),
        650
      );
    }
    onClick?.(e);
  };

  return (
    <button
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...rest}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-current opacity-25"
          style={{ left: r.x, top: r.y, x: "-50%", y: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.25 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        />
      ))}
      <span className="relative">{children}</span>
    </button>
  );
}
