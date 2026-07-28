"use client";

import * as React from "react";
import Link from "next/link";
import { Reveal } from "@/components/primitives/reveal";
import { MagneticButton } from "@/components/primitives/magnetic-button";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * DualCTA — the closing call-to-action band. Two paths: book a stay
 * (customer) or list a property (hotelAdmin onboarding). The primary
 * CTA uses the magnetic effect; the secondary is a ghost button.
 */
export function DualCTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <Reveal className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-accent/8 p-10 text-center sm:p-16">
        <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Your next stay starts here.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          Browse curated properties or list your own — both paths take less
          time than reading this sentence.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton
            onClick={() => {
              if (typeof window !== "undefined")
                window.location.assign("/hotels");
            }}
            className="shine-sweep inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Book a stay
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <Button
            asChild
            variant="outline"
            className="h-12 border-border bg-transparent px-8 text-sm font-medium hover:bg-muted"
          >
            <Link href="/register">List your property</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
