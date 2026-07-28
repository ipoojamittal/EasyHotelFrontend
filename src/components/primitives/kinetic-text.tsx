"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useKineticText } from "@/lib/animation/use-kinetic-text";
import { cn } from "@/lib/utils";

/**
 * KineticText — editorial headline that reveals word-by-word (or
 * char-by-char) with a mask-wipe + lift. For warm-mode hero/section
 * headlines. Respects prefers-reduced-motion (opacity-only fade).
 *
 * Each segment is wrapped in an overflow-hidden span so the y-translate
 * reads as a "rise from below the line" rather than a floating word.
 */
export function KineticText({
  text,
  split = "word",
  stagger = 0.06,
  delay = 0,
  className,
  segmentClassName,
}: {
  text: string;
  split?: "word" | "char";
  stagger?: number;
  delay?: number;
  className?: string;
  segmentClassName?: string;
}) {
  const { segments, container, segment } = useKineticText(text, {
    split,
    stagger,
    delay,
  });

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {segments.map((seg, i) => (
        <span
          key={`${seg}-${i}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span
            className={cn("inline-block", segmentClassName)}
            variants={segment}
          >
            {seg}
            {split === "word" && i < segments.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
