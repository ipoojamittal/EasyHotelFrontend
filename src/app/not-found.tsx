import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Global 404 — shown when no route matches. Keeps the brand voice
 * (calm, not alarming) and offers a clear way back.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="font-display text-6xl tracking-tight text-muted-foreground">404</p>
        <h1 className="font-display text-2xl tracking-tight">Page not found</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
