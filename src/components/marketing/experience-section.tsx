"use client";

import * as React from "react";
import { Reveal } from "@/components/primitives/reveal";
import { VariableFontHover } from "@/components/primitives/variable-font-hover";

/**
 * ExperienceSection — editorial section with large imagery placeholder,
 * scroll-driven parallax, and staggered text. The warm-mode signature:
 * asymmetric editorial grid, not uniform 12-col.
 *
 * Photography is placeholder (gradient) until real hotel images are wired.
 */
export function ExperienceSection() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
        {/* Text column */}
        <div className="space-y-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The experience
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              <VariableFontHover axis="wght" from={400} to={600}>
                Hospitality, refined.
              </VariableFontHover>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-base text-muted-foreground">
              Every property in our collection is chosen for its character —
              the kind of place that turns a stay into a story. From boutique
              city hotels to seaside retreats, the details matter.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="space-y-3 pt-2">
              {[
                "Curated properties, not a faceless directory",
                "Transparent pricing — no surprise fees",
                "Book in under a minute, manage from anywhere",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground/90"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Image column — asymmetric, larger */}
        <Reveal variant="scale" delay={0.1} className="relative">
          <div className="relative aspect-[5/6] overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 via-muted to-accent/15">
            {/* Decorative layered gradient (placeholder for photography) */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 30% 20%, var(--primary) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, var(--accent) 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-display text-xl text-foreground/90">
                “The small things are not small.”
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
