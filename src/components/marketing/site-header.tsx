"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { fullName, initials } from "@/lib/format";
import { AnimatedUnderline } from "@/components/primitives/animated-underline";

/**
 * SiteHeader — marketing site top nav. Auth-aware: shows "Sign in" for
 * anonymous users, a profile dropdown for authenticated users. Theme
 * toggle included (defaults to light for the warm customer site).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  // next-themes resolves on the client; avoid hydration mismatch by
  // deferring the theme toggle render until after mount. Using a
  // microtask defers the setState out of the effect body.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const navLinks = [
    { href: "/hotels", label: "Browse stays" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg tracking-tight"
          aria-label="HMS home"
        >
          <span className="text-foreground">hms</span>
          <span className="text-primary">.</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <AnimatedUnderline
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </AnimatedUnderline>
          ))}

          {/* Theme toggle */}
          {mounted ? (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          ) : null}

          {/* Auth-aware actions */}
          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium leading-none">
                    {fullName(user.firstName, user.lastName)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">My bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">Profile</Link>
                </DropdownMenuItem>
                {user.role !== "customer" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <AnimatedUnderline
                href="/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </AnimatedUnderline>
              <Button asChild size="sm" className="h-8">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
