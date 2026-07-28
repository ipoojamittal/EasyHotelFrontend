import * as React from "react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ScrollProgressBar } from "@/components/primitives/scroll-progress-bar";

/**
 * Marketing layout — warm light theme, public pages.
 * Lenis smooth scroll + grain overlay + scroll progress bar.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <div className="grain-overlay flex min-h-full flex-col">
        <ScrollProgressBar />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SmoothScrollProvider>
  );
}
