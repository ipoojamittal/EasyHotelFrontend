import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from "date-fns";
import type { BookingStatus, Role, RoomStatus } from "@/types/api";

/* ---------------------------------------------------------------------------
   Currency
   --------------------------------------------------------------------------- */
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatterCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a whole-dollar amount (e.g. 1200 → "$1,200"). Use for nightly rates. */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return "—";
  return currencyFormatter.format(amount);
}

/** Format a precise amount with cents (e.g. 1200.5 → "$1,200.50"). Use for totals. */
export function formatCurrencyPrecise(amount: number | undefined | null): string {
  if (amount == null) return "—";
  return currencyFormatterCents.format(amount);
}

/* ---------------------------------------------------------------------------
   Dates — the backend returns ISO 8601 strings (e.g. "2025-08-01T14:30:00Z"
   for timestamps, "2025-08-01" for booking dates).
   --------------------------------------------------------------------------- */
function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(
  value: string | Date | undefined | null,
  pattern = "MMM d, yyyy"
): string {
  if (!value) return "—";
  try {
    return format(toDate(value), pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(
  value: string | Date | undefined | null
): string {
  return formatDate(value, "MMM d, yyyy · h:mm a");
}

export function formatRelative(
  value: string | Date | undefined | null
): string {
  if (!value) return "—";
  try {
    return formatDistanceToNow(toDate(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

/* ---------------------------------------------------------------------------
   Nights — booking duration helper
   --------------------------------------------------------------------------- */
export function nightsBetween(
  checkIn: string | Date,
  checkOut: string | Date
): number {
  try {
    return Math.max(0, differenceInCalendarDays(toDate(checkOut), toDate(checkIn)));
  } catch {
    return 0;
  }
}

/* ---------------------------------------------------------------------------
   Initials — for avatars
   --------------------------------------------------------------------------- */
export function initials(
  firstName?: string,
  lastName?: string
): string {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function fullName(
  firstName?: string,
  lastName?: string
): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Guest";
}

/* ---------------------------------------------------------------------------
   Status maps — UI metadata for booking/room statuses + roles
   --------------------------------------------------------------------------- */
export interface StatusMeta {
  label: string;
  /** Tailwind classes for a badge: bg + text. */
  badge: string;
  /** Dot color (for inline indicators). */
  dot: string;
}

export const bookingStatusMeta: Record<BookingStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    badge: "bg-warning/15 text-warning border-warning/30",
    dot: "bg-warning",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-info/15 text-info border-info/30",
    dot: "bg-info",
  },
  "checked-in": {
    label: "Checked in",
    badge: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
  },
  "checked-out": {
    label: "Checked out",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
  "no-show": {
    label: "No-show",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

export const roomStatusMeta: Record<RoomStatus, StatusMeta> = {
  available: {
    label: "Available",
    badge: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
  },
  occupied: {
    label: "Occupied",
    badge: "bg-info/15 text-info border-info/30",
    dot: "bg-info",
  },
  cleaning: {
    label: "Cleaning",
    badge: "bg-warning/15 text-warning border-warning/30",
    dot: "bg-warning",
  },
  out_of_service: {
    label: "Out of service",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

export const roleMeta: Record<Role, { label: string; badge: string }> = {
  customer: {
    label: "Customer",
    badge: "bg-muted text-muted-foreground border-border",
  },
  staff: {
    label: "Staff",
    badge: "bg-info/15 text-info border-info/30",
  },
  hotelAdmin: {
    label: "Hotel admin",
    badge: "bg-primary/15 text-primary border-primary/30",
  },
  superAdmin: {
    label: "Super admin",
    badge: "bg-accent/15 text-accent border-accent/30",
  },
};

/** Human-readable label for a status code (defensive). */
export function statusLabel(code: string): string {
  return (
    bookingStatusMeta[code as BookingStatus]?.label ??
    roomStatusMeta[code as RoomStatus]?.label ??
    code
  );
}
