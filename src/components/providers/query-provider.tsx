"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";

/**
 * QueryProvider — TanStack Query v5 setup following the official
 * Next.js App Router pattern.
 *
 * - Server: a fresh QueryClient per request (via useState initializer) so
 *   data never leaks between users/requests.
 * - Browser: a single module-level QueryClient reused across renders so
 *   caches survive re-renders and route transitions.
 *
 * Server Components prefetch into a separate QueryClient via
 * `lib/query/get-query-client` + HydrationBoundary — see those files.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Reasonable stale time for an HMS — booking/room lists don't change
        // every second, so 30s of SWR keeps the dashboard snappy without
        // hammering the backend.
        staleTime: 30 * 1000,
        retry: (failureCount, error) => {
          // Don't retry on 4xx (client errors) — they won't fix themselves.
          const status = (error as { status?: number }).status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a fresh client (never share between requests).
    return makeQueryClient();
  }
  // Browser: reuse the singleton after the first render.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState initializer runs once per component instance; on the server
  // this is per-request, on the browser it's once (then we reuse the
  // singleton above).
  const [queryClient] = React.useState(getQueryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
