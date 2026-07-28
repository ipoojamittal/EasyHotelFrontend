"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedUnderline — a link whose underline grows from left→right on
 * hover (and right→left on leave). Pure CSS, no JS. Use for nav links
 * and inline editorial links in warm mode.
 */
export function AnimatedUnderline({
  children,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "relative inline-block after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:after:scale-x-100",
        className
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
