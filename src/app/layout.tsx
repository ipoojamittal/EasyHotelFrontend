import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/**
 * Fonts — self-hosted via next/font (no external requests, no layout shift).
 * - Inter:    body text everywhere + entire dark dashboard.
 * - Fraunces: editorial display, warm-mode only (hero, section headlines, hotel names).
 *             Variable font with opsz + wght + SOFT axes (used for kinetic hover effects).
 * - Geist Mono: dashboard mono — IDs, codes, keyboard hints in command menu.
 *
 * CSS variables (--font-inter / --font-fraunces / --font-geist-mono) are
 * consumed by globals.css via the @theme inline block.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Variable font: expose the optical size + softness axes (weight is
  // included by default) so we can animate font-variation-settings for
  // kinetic hover effects.
  axes: ["opsz", "SOFT"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HMS — Hotel Management System",
    template: "%s · HMS",
  },
  description:
    "A modern hotel management platform — book stays, manage rooms, run your property.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // suppressHydrationWarning: next-themes sets the class attribute on <html>
      // before hydration; without this, React warns about the mismatch.
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
