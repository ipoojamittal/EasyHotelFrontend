"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * SiteFooter — multi-column marketing footer with a newsletter signup.
 * The newsletter is frontend-only (no backend endpoint) — it shows a
 * success toast on submit.
 */
export function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    toast.success("Thanks for subscribing. We'll be in touch.");
  };

  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="font-display text-xl tracking-tight"
              aria-label="HMS home"
            >
              <span className="text-foreground">hms</span>
              <span className="text-primary">.</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              A modern hotel management platform — an immersive booking
              experience for guests and a precise operations dashboard for
              properties.
            </p>
            {subscribed ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re on the list. Welcome aboard.
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="flex max-w-sm gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
                <Button type="submit" size="sm" className="h-9 shrink-0">
                  Subscribe
                </Button>
              </form>
            )}
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/hotels"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  Browse stays
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  Create an account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Account
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/account"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  My bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/account/profile"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} HMS. All rights reserved.</p>
          <p>Built with Next.js, Tailwind CSS, and Motion.</p>
        </div>
      </div>
    </footer>
  );
}
