"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KineticText } from "@/components/primitives/kinetic-text";
import { MagneticButton } from "@/components/primitives/magnetic-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Hero — the landing page hero. Full-bleed warm canvas with a kinetic
 * mask-wipe headline, a magnetic primary CTA, and a floating search bar
 * that routes to /hotels with the destination as a query param.
 *
 * Photography-first: the hero uses a CSS gradient backdrop as a stand-in
 * until real hotel imagery is available (the backend stores image URLs
 * per hotel). The gradient is warm and restrained — no SaaS purple.
 */
export function Hero() {
  const router = useRouter();
  const [destination, setDestination] = React.useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("city", destination.trim());
    router.push(`/hotels${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient backdrop (placeholder for full-bleed photography) */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 70%, var(--accent) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center sm:py-32 lg:py-40">
        <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          A modern hotel management platform
        </p>

        {/* Kinetic headline — word-by-word mask-wipe reveal */}
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <KineticText text="Run your property." split="word" />
          <br />
          <span className="text-primary">
            <KineticText text="Book the stay." split="word" delay={0.3} />
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
          A dual-mode hotel management system — an immersive customer booking
          experience and a precise, keyboard-first operations dashboard. One
          platform, two surfaces.
        </p>

        {/* CTAs — magnetic primary + ghost secondary */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <MagneticButton
            onClick={() => router.push("/hotels")}
            className="shine-sweep inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Explore stays
          </MagneticButton>
          <Button
            asChild
            variant="outline"
            className="h-12 border-border bg-transparent px-8 text-sm font-medium hover:bg-muted"
          >
            <Link href="/register">List your property</Link>
          </Button>
        </div>

        {/* Floating search bar */}
        <form
          onSubmit={onSearch}
          className="mt-16 flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm"
        >
          <Input
            type="text"
            placeholder="Where to? Try a city…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="h-9 flex-1 border-0 bg-transparent focus-visible:ring-0"
          />
          <Button type="submit" size="sm" className="h-9 shrink-0 rounded-full">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
