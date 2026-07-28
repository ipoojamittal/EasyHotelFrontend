"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
 * Root route — the marketing landing for anonymous users. Authenticated
 * users are redirected by role (customer → /account, staff/admin → /dashboard).
 *
 * The landing is rendered here (not in the (marketing) group) because the
 * auth redirect needs to run before content. For authenticated users we
 * show a loader while the redirect fires.
 */
export default function HomePage() {
  const { user, status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      const dest = user.role === "customer" ? "/account" : "/dashboard";
      router.replace(dest);
    }
  }, [status, user, router]);

  if (status === "loading") {
    return <Loader label="Loading…" />;
  }
  if (status === "authenticated") {
    return <Loader label="Taking you to your dashboard…" />;
  }

  // Unauthenticated → full immersive landing.
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
