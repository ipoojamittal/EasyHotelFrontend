"use client";

import * as React from "react";
import { AnimatedCounter } from "@/components/primitives/animated-counter";
import { Reveal } from "@/components/primitives/reveal";

/**
 * StatsBand — animated counters in a horizontal band. Numbers count up
 * when scrolled into view. The stats are illustrative (no backend
 * analytics endpoint) — they communicate the product's scope.
 */
const stats = [
  { value: 120, label: "Properties", suffix: "+" },
  { value: 48, label: "Cities", suffix: "" },
  { value: 99, label: "Uptime", suffix: "%" },
  { value: 24, label: "Support", suffix: "/7" },
];

export function StatsBand() {
  return (
    <section className="border-y border-border/60 bg-primary/5">
      <Reveal className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  format={(n) => `${Math.round(n)}${stat.suffix}`}
                />
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
