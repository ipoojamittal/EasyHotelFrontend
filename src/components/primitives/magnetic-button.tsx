"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useMagnetic } from "@/lib/animation/use-magnetic";
import { cn } from "@/lib/utils";

/**
 * MagneticButton — a button that drifts toward the cursor while hovered
 * (the "magnetic" effect). Falls back to a normal button under
 * prefers-reduced-motion or on touch-primary devices.
 *
 * Use for primary CTAs on the marketing site only — it's a signature
 * interaction, not for every button.
 *
 * Note: doesn't forward a ref because the internal useMagnetic ref drives
 * the transform. If you need a ref to the underlying button, use a plain
 * <Button> and wrap the magnetic effect yourself.
 */
export type MagneticButtonProps = HTMLMotionProps<"button"> & {
  /** 0–1, how strongly the button follows the cursor. */
  strength?: number;
};

export function MagneticButton({
  strength = 0.25,
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const { ref, x, y } = useMagnetic<HTMLButtonElement>(strength);
  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
