/**
 * SiteFooter — marketing site footer. Minimal Phase-0 stub; expanded in
 * Phase 1 with multi-column nav + newsletter.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          <span className="font-display text-base text-foreground">hms</span>
          <span className="text-primary">.</span>{" "}
          — a modern hotel management platform.
        </p>
        <p className="text-xs">© {new Date().getFullYear()} HMS. All rights reserved.</p>
      </div>
    </footer>
  );
}
