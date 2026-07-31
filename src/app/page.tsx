"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader } from "@/components/primitives/loader";
import { Hero } from "@/components/marketing/hero";
import { FeaturedHotels } from "@/components/marketing/featured-hotels";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { ValuesBento } from "@/components/marketing/values-bento";
import { StatsBand } from "@/components/marketing/stats-band";
import { Testimonials } from "@/components/marketing/testimonials";
import { DualCTA } from "@/components/marketing/dual-cta";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ScrollProgressBar } from "@/components/primitives/scroll-progress-bar";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Root route — the marketing landing page. Visible to everyone (anonymous
 * and authenticated). The site header is auth-aware: anonymous users see
 * "Sign in", authenticated users see their avatar dropdown with a link
 * to their dashboard/account.
 *
 * Authenticated users are NOT auto-redirected away — they can browse the
 * landing page and navigate to their dashboard via the header dropdown.
 */
export default function HomePage() {
  const { status } = useAuth();

  if (status === "loading") {
    return <Loader label="Loading…" />;
  }

  return (
    <SmoothScrollProvider>
      <div className="grain-overlay flex min-h-screen flex-col">
        <ScrollProgressBar />
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <FeaturedHotels />
          <ExperienceSection />
          <ValuesBento />
          <StatsBand />
          <Testimonials />
          <DualCTA />
        </main>
        <SiteFooter />
      </div>
    </SmoothScrollProvider>
  );
}
