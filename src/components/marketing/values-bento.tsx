"use client";

import * as React from "react";
import { Reveal, Stagger } from "@/components/primitives/reveal";
import { SpotlightCard } from "@/components/primitives/spotlight-card";
import {
  Calendar,
  BedDouble,
  ShieldCheck,
  Keyboard,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

/**
 * ValuesBento — feature grid with lucide icons. Spotlight cards on hover.
 * Asymmetric bento (not uniform cells) to avoid the generic AI-template look.
 */
const features = [
  {
    icon: Calendar,
    title: "Effortless booking",
    description:
      "A four-step flow that respects your time — dates, room, details, done.",
    className: "sm:col-span-2",
  },
  {
    icon: BedDouble,
    title: "Room-level control",
    description: "Manage every room, every status, every override.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Customers, staff, and admins each see exactly what they need.",
  },
  {
    icon: Keyboard,
    title: "Keyboard-first ops",
    description: "Command-K menu, tab navigation, no mouse required.",
    className: "sm:col-span-2",
  },
  {
    icon: LayoutDashboard,
    title: "Live dashboard",
    description:
      "Occupancy, arrivals, departures, and room status at a glance.",
  },
  {
    icon: Sparkles,
    title: "Premium motion",
    description:
      "Spring physics, kinetic typography, and surface-lift depth. Restraint, not flash.",
  },
];

export function ValuesBento() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <Reveal className="mb-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Why HMS
        </p>
        <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Built for guests and operators alike
        </h2>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Stagger.Item
            key={feature.title}
            className={feature.className}
          >
            <SpotlightCard className="h-full p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </SpotlightCard>
          </Stagger.Item>
        ))}
      </Stagger>
    </section>
  );
}
