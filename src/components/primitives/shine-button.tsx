"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ShineButton — a primary CTA with a one-shot shine sweep on hover.
 * The sweep is a CSS pseudo-element (`.shine-sweep` from globals.css),
 * so there's no JS per-frame cost. Wrap any button/link.
 *
 * Use sparingly — only for the single most important CTA on a page.
 */
export function ShineButton({
  children,
  className,
  as: Tag = "button",
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("shine-sweep", className)} {...rest}>
      {children}
    </Tag>
  );
}
