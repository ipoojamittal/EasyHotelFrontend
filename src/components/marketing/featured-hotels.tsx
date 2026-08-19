"use client";

import * as React from "react";
import Link from "next/link";
import { useHotels } from "@/lib/query";
import { HotelCardReveal, HotelCardSkeleton } from "./hotel-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { Hotel as HotelIcon } from "lucide-react";

/**
 * FeaturedHotels — landing page section showing a curated grid of hotels.
 * Fetches the first page of active hotels (limit 6) via TanStack Query.
 * Staggered reveal on scroll. If the backend is unreachable or empty,
 * shows a graceful empty state (not an error).
 */
export function FeaturedHotels() {
  const { data, isLoading, isError } = useHotels({
    limit: 6,
    isDeleted: false,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const hotels = data?.hotels ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Featured stays
          </p>
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Properties worth the journey
          </h2>
        </div>
        <Button
          asChild
          variant="ghost"
          className="hidden shrink-0 text-primary hover:bg-transparent sm:inline-flex"
        >
          <Link href="/hotels">View all →</Link>
        </Button>
      </div>

      {isError ? (
        <EmptyState
          icon={HotelIcon}
          title="Couldn't load hotels"
          description="Please check your connection and try again."
          action={
            <Button asChild size="sm">
              <Link href="/hotels">Browse all stays</Link>
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState
          icon={HotelIcon}
          title="No hotels available yet"
          description="New properties are being added. Check back soon."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel, i) => (
            <HotelCardReveal
              key={hotel.id}
              hotel={hotel}
              index={i}
              priority={i < 3}
            />
          ))}
        </div>
      )}

      <div className="mt-10 text-center sm:hidden">
        <Button asChild variant="outline">
          <Link href="/hotels">View all stays →</Link>
        </Button>
      </div>
    </section>
  );
}
