import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts — Next.js 16's renamed middleware.
 *
 * The HMS JWT lives in sessionStorage (client-only), so the proxy cannot
 * enforce auth server-side — that's handled by AuthGuard on the client.
 * The proxy is kept as a thin pass-through with a matcher that excludes
 * static assets, ready to host server-side logic (e.g. A/B test routing,
 * geo redirects, feature flags) without running on every static file.
 *
 * If we later move the token to an httpOnly cookie, this is where server-
 * side auth enforcement would go.
 */
export function proxy(_request: NextRequest) {
  // Intentionally a pass-through; see file docstring. The _request param
  // is required by the proxy signature and will be used when server-side
  // logic is added.
  void _request;
  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets, images, and the backend API
  // (which is on another origin and not proxied through Next.js).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
