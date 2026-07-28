"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/lib/animation/presets";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";

/**
 * PageTransition — wraps route children in a subtle fade+lift on pathname
 * change. Mounted once in the App Router layout's client boundary.
 *
 * Uses `mode="wait"` so the outgoing page exits before the incoming one
 * enters (cleaner than overlap for content-heavy pages). Reduced-motion
 * users get an instant swap.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : pageTransition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
