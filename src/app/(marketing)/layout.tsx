import * as React from "react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/**
 * Marketing layout — warm light theme, public pages.
 * The grain overlay adds the barely-visible paper warmth (per the design plan).
 * Header/footer are minimal stubs for Phase 0; expanded in Phase 1.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain-overlay flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
