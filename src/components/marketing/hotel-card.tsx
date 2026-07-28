"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { SpotlightCard } from "@/components/primitives/spotlight-card";
import type { Hotel } from "@/types/api";
import { cn } from "@/lib/utils";

/**
 * HotelCard — the signature hotel card used on the landing featured grid
 * and the /hotels browse page. Spotlight cursor effect + image zoom on
 * hover. Links to /hotels/[hotelId].
 *
 * The backend stores images as URL arrays; if a hotel has no images we
 * show a warm gradient placeholder so the grid never looks broken.
 */
export function HotelCard({
  hotel,
  className,
  priority,
}: {
  hotel: Hotel;
  className?: string;
  /** Load the image eagerly (for above-the-fold cards). */
  priority?: boolean;
}) {
  const heroImage = hotel.images?.[0];
  const city = hotel.address?.city;
  const country = hotel.address?.country;
  const location = [city, country].filter(Boolean).join(", ");

  return (
    <SpotlightCard
      className={cn("group", className)}
      spotlightColor="var(--primary)"
    >
      <Link
        href={`/hotels/${hotel.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={hotel.name}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-primary/10 via-muted to-accent/10"
              aria-hidden="true"
            />
          )}
          {/* Subtle dark gradient at the bottom for text legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"
            aria-hidden="true"
          />
          {location ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
              {location}
            </span>
          ) : null}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-display text-lg leading-tight tracking-tight text-foreground">
            {hotel.name}
          </h3>
          {hotel.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {hotel.description}
            </p>
          ) : null}
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {hotel.amenities?.length ?? 0} amenities
            </span>
            <span className="text-xs font-medium text-primary">
              View details →
            </span>
          </div>
        </div>
      </Link>
    </SpotlightCard>
  );
}

/**
 * HotelCardSkeleton — content-matched loading state for the HotelCard.
 */
export function HotelCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="aspect-[4/3] shimmer bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-1/2 shimmer rounded" />
      </div>
    </div>
  );
}

/**
 * HotelCardReveal — HotelCard wrapped in a motion reveal for staggered
 * grid entrance. Used by the featured section and browse grid.
 */
export function HotelCardReveal({
  hotel,
  index = 0,
  priority,
}: {
  hotel: Hotel;
  index?: number;
  priority?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0, 0, 0.15, 1] as const,
      }}
    >
      <HotelCard hotel={hotel} priority={priority} />
    </motion.div>
  );
}
