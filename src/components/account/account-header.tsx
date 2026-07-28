"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

/**
 * AccountHeader — top nav for the customer /account area. Auth-aware.
 */
export function AccountHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/account"
          className="font-display text-lg tracking-tight"
          aria-label="My account"
        >
          <span className="text-foreground">hms</span>
          <span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/account"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            My bookings
          </Link>
          <Link
            href="/account/profile"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Profile
          </Link>
          {user ? (
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
              {user.firstName} {user.lastName}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
