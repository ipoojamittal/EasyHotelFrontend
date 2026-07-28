import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * SiteHeader — marketing site top nav. Minimal Phase-0 stub; expanded in
 * Phase 1 with the full nav, theme toggle, auth-aware actions.
 */
export function SiteHeader() {
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
          <Link
            href="/hotels"
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            Browse stays
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
