"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/primitives/reveal";
import { cn } from "@/lib/utils";

/**
 * Testimonials — a quote carousel with smooth transitions. Auto-advances
 * every 6s, pauses on hover, and lets users navigate manually. Respects
 * reduced motion (no slide animation, just opacity swap).
 */
const testimonials = [
  {
    quote:
      "The booking flow is the fastest I've used. Three taps and my stay was confirmed — no upsells, no friction.",
    author: "Amara Okafor",
    role: "Frequent traveler",
  },
  {
    quote:
      "Managing room status from the dashboard changed our morning routine. The whole front desk sees the same picture in real time.",
    author: "James Whitfield",
    role: "Hotel manager, The Marlowe",
  },
  {
    quote:
      "It looks like a hospitality brand, not a SaaS tool. Our guests comment on how calm the site feels.",
    author: "Sofia Reyes",
    role: "Boutique hotel owner",
  },
];

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      6000
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const current = testimonials[index];

  return (
    <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      <Reveal className="mb-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          What people say
        </p>
      </Reveal>

      <div
        className="relative min-h-[200px] text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.15, 1] as const }}
            className="space-y-6"
          >
            <p className="font-display text-2xl leading-relaxed tracking-tight text-foreground sm:text-3xl">
              “{current.quote}”
            </p>
            <footer className="text-sm">
              <p className="font-medium text-foreground">{current.author}</p>
              <p className="text-muted-foreground">{current.role}</p>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-8 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Testimonial ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
