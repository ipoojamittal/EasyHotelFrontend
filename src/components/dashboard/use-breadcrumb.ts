"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * useBreadcrumb — derives a breadcrumb trail from the current pathname.
 * Returns an array of { label, href } segments. The first segment is
 * always "Dashboard".
 *
 * Mapping is convention-based from the route segments:
 *   /dashboard              → [Dashboard]
 *   /dashboard/hotel        → [Dashboard, Hotel]
 *   /dashboard/room-types   → [Dashboard, Room types]
 *   /dashboard/rooms/123    → [Dashboard, Rooms, 123]
 *
 * Dynamic ids (UUID-like) are kept as-is; in future we can resolve them
 * to friendly names via the query cache.
 */
const LABELS: Record<string, string> = {
  hotel: "Hotel",
  "room-types": "Room types",
  rooms: "Rooms",
  bookings: "Bookings",
  staff: "Staff",
  settings: "Settings",
  new: "New",
  book: "Book",
  profile: "Profile",
  password: "Password",
};

export function useBreadcrumb() {
  const pathname = usePathname();
  return React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    // segments[0] === "dashboard"
    const crumbs = [{ label: "Dashboard", href: "/dashboard" }];
    let href = "";
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      href += "/" + segments.slice(0, i + 1).join("/");
      crumbs.push({
        label: LABELS[seg] ?? seg,
        href,
      });
    }
    return crumbs;
  }, [pathname]);
}
