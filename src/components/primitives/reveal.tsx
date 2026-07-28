"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";
import { revealUp, revealFade, revealScale } from "@/lib/animation/presets";
import { useReducedMotion } from "@/lib/animation/use-reduced-motion";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "scale";

const variantMap: Record<RevealVariant, Variants> = {
  up: revealUp,
  fade: revealFade,
  scale: revealScale,
};

/**
 * Reveal — animate a single block into view on scroll. Uses `whileInView`
 * with `viewport={{ once: true }}` so it plays once and then stays put.
 * Respects prefers-reduced-motion (opacity-only, no transform).
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const reduced = useReducedMotion();
  const variants = reduced ? revealFade : variantMap[variant];
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Stagger — wraps a list of children and staggers their reveal. Each
 * direct child should be a <Stagger.Item> (or its own motion element with
 * the same `variants`).
 */
const StaggerContext = React.createContext<Variants | null>(null);

export function Stagger({
  children,
  dense = false,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  dense?: boolean;
  className?: string;
  as?: React.ElementType;
}) {
  const reduced = useReducedMotion();
  const container = React.useMemo(
    () =>
      reduced
        ? { hidden: {}, show: { transition: { staggerChildren: 0 } } }
        : dense
          ? { hidden: {}, show: { transition: { staggerChildren: 0.03 } } }
          : { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } },
    [reduced, dense]
  );
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <StaggerContext.Provider value={variantMap.up}>
      <MotionTag
        className={cn(className)}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      >
        {children}
      </MotionTag>
    </StaggerContext.Provider>
  );
}

function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  const variants = React.useContext(StaggerContext) ?? revealUp;
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag className={cn(className)} variants={variants}>
      {children}
    </MotionTag>
  );
}

Stagger.Item = StaggerItem;
