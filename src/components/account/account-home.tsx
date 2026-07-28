"use client";

import * as React from "react";
import Link from "next/link";
import { useMyBookings } from "@/lib/query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { BookingStatusBadge } from "@/components/primitives/status-badge";
import { formatCurrencyPrecise, formatDate, nightsBetween } from "@/lib/format";
import type { Booking } from "@/types/api";
import { CalendarDays, MapPin, BedDouble, ArrowRight } from "lucide-react";

/**
 * AccountHome — the customer's /account landing. Shows their booking
 * history with status filter tabs (All, Upcoming, Past, Cancelled).
 * Each booking is a card linking to /account/bookings/[id].
 *
 * The "Upcoming"/"Past" tabs are computed client-side from checkOutDate
 * since the backend only filters by status. "All" shows every booking.
 */
type TabValue = "all" | "upcoming" | "past" | "cancelled";

export function AccountHome() {
  const [tab, setTab] = React.useState<TabValue>("all");

  // Fetch all the user's bookings (no status filter) so we can compute
  // upcoming/past client-side. The backend paginates; we pull a generous
  // first page (limit 50) — sufficient for a personal booking history.
  const { data, isLoading, isError } = useMyBookings({ limit: 50 });

  const filtered = React.useMemo(() => {
    const allBookings = data?.bookings ?? [];
    const now = new Date();
    if (tab === "all") return allBookings;
    if (tab === "cancelled")
      return allBookings.filter((b) => b.status === "cancelled");
    if (tab === "upcoming")
      return allBookings.filter(
        (b) =>
          b.status !== "cancelled" &&
          b.status !== "no-show" &&
          new Date(b.checkOutDate) >= now
      );
    if (tab === "past")
      return allBookings.filter(
        (b) =>
          b.status !== "cancelled" &&
          new Date(b.checkOutDate) < now
      );
    return allBookings;
  }, [data, tab]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">My bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your stay history, upcoming and past.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError ? (
        <EmptyState
          title="Couldn't load your bookings"
          description="Please check your connection and try again."
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={
            tab === "upcoming"
              ? "No upcoming stays"
              : tab === "past"
                ? "No past stays yet"
                : tab === "cancelled"
                  ? "No cancelled bookings"
                  : "No bookings yet"
          }
          description={
            tab === "all" || tab === "upcoming"
              ? "Browse our collection and book your first stay."
              : undefined
          }
          action={
            tab === "all" || tab === "upcoming" ? (
              <Button asChild size="sm">
                <Link href="/hotels">Browse stays</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * BookingRow — a single booking in the list. Links to the detail page.
 */
function BookingRow({ booking }: { booking: Booking }) {
  const hotelName =
    typeof booking.hotel === "object" ? booking.hotel.name : "Your hotel";
  const roomNumber =
    typeof booking.room === "object" ? booking.room.roomNumber : "—";
  const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);

  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="truncate font-display text-lg tracking-tight">
            {hotelName}
          </h3>
          <BookingStatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5" />
            Room {roomNumber}
          </span>
          <span>{nights} {nights === 1 ? "night" : "nights"}</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "guest" : "guests"}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-display text-lg text-foreground">
          {formatCurrencyPrecise(booking.totalPrice)}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
