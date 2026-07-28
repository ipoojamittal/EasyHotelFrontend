/**
 * Motion presets — shared spring/tween configs so every animation in the
 * app feels like one product. Springs are preferred (no duration jank);
 * tweens are reserved for opacity/colour where springs feel mushy.
 *
 * All durations/easings also exist as CSS variables in globals.css for
 * CSS-driven animations (scroll-progress, shimmer, mask-wipe).
 */
import type { Transition, Variants } from "motion/react";

/* --- Springs ------------------------------------------------------------- */
export const spring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.9,
};

/** Snappy spring for small UI elements (buttons, chips, toggles). */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 34,
  mass: 0.8,
};

/** Soft spring for larger surfaces (cards, sheets, dialogs). */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 1,
};

/* --- Tweens -------------------------------------------------------------- */
export const easeStandard: Transition = {
  duration: 0.2,
  ease: [0.2, 0, 0.38, 0.9] as const,
};
export const easeDecelerate: Transition = {
  duration: 0.3,
  ease: [0, 0, 0.2, 1] as const,
};
export const easeEmphasize: Transition = {
  duration: 0.4,
  ease: [0, 0, 0.15, 1] as const,
};

/* --- Stagger ------------------------------------------------------------- */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerContainerDense: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

/* --- Reveal (scroll-into-view) ------------------------------------------- */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: easeDecelerate },
};

export const revealFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: easeStandard },
};

export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springSoft },
};

/* --- Page transition (App Router route swaps) ---------------------------- */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: easeDecelerate },
  exit: { opacity: 0, y: -8, transition: easeStandard },
};
