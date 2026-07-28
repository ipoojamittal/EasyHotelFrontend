"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Gallery — hero image gallery for the hotel detail page. Shows a large
 * main image + thumbnail strip. Clicking a thumbnail swaps the main
 * image with a layout-id morph (shared-element transition). If the hotel
 * has no images, shows a warm gradient placeholder.
 */
export function Gallery({
  images,
  name,
  className,
}: {
  images: string[];
  name: string;
  className?: string;
}) {
  const [active, setActive] = React.useState(0);
  const hasImages = images.length > 0;

  if (!hasImages) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 via-muted to-accent/15",
          className
        )}
        aria-label={`${name} — no images available`}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 20%, var(--primary) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, var(--accent) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${name} — image ${active + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.15, 1] as const }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === active
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
