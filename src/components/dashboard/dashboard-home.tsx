"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useMyHotel, useRooms, useHotelBookings } from "@/lib/query";
import { KpiCard } from "@/components/primitives/kpi-card";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { BookingStatusBadge, RoomStatusBadge } from "@/components/primitives/status-badge";
import { formatCurrencyPrecise, formatDate } from "@/lib/format";
import type { Booking, Room, RoomType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { SuperAdminHotels } from "./superadmin-hotels";
import {
  BedDouble,
  TrendingUp,
  LogIn,
  LogOut,
  DoorOpen,
  CalendarDays,
  ArrowRight,
  Building2,
} from "lucide-react";

/**
 * DashboardHome — the KPI bento grid. Computes metrics client-side from
 * list endpoints (the backend has no analytics endpoint — flagged in
 * the plan). Shown for staff/hotelAdmin/superAdmin.
 *
 * KPIs:
 * - Occupancy % (occupied / total rooms)
 * - ADR (average daily rate = avg of room prices)
 * - Arrivals today (bookings with checkInDate = today, status != cancelled)
 * - Departures today (bookings with checkOutDate = today, status != cancelled)
 * - Room status breakdown (available/occupied/cleaning/out_of_service)
 * - Recent bookings (latest 5)
 */
export function DashboardHome() {
  const { user } = useAuth();
  const hotelId = user?.hotelId;

  const { data: hotel, isLoading: hotelLoading } = useMyHotel();
  const { data: rooms, isLoading: roomsLoading } = useRooms(hotelId ?? "", {
    limit: 100,
  });
  const { data: bookingsData, isLoading: bookingsLoading } = useHotelBookings(
    hotelId ?? "",
    { limit: 50 }
  );

  // superAdmin has no hotelId → show the global hotel directory inline.
  if (user?.role === "superAdmin") {
    return <SuperAdminHotels />;
  }

  if (!hotelId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
        </div>
        <EmptyState
          icon={Building2}
          title="No hotel assigned"
          description="Your account isn't linked to a hotel. Please contact an administrator."
        />
      </div>
    );
  }

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const roomList = rooms ?? [];
  const bookings = bookingsData?.bookings ?? [];

  // KPIs
  const totalRooms = roomList.length;
  const occupiedRooms = roomList.filter((r) => r.status === "occupied").length;
  const occupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const prices = roomList
    .map((r) => {
      const rt = typeof r.roomType === "object" ? (r.roomType as RoomType) : null;
      return r.pricePerNight ?? rt?.basePrice ?? 0;
    })
    .filter((p) => p > 0);
  const adr = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const activeBookings = bookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "no-show"
  );
  const arrivalsToday = activeBookings.filter(
    (b) => b.checkInDate.slice(0, 10) === todayStr
  ).length;
  const departuresToday = activeBookings.filter(
    (b) => b.checkOutDate.slice(0, 10) === todayStr
  ).length;

  const statusCounts = {
    available: roomList.filter((r) => r.status === "available").length,
    occupied: occupiedRooms,
    cleaning: roomList.filter((r) => r.status === "cleaning").length,
    out_of_service: roomList.filter((r) => r.status === "out_of_service").length,
  };

  const recentBookings = bookings.slice(0, 5);

  const loading = hotelLoading || roomsLoading || bookingsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {hotel?.name ?? "Dashboard"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDate(today.toISOString())} — today&apos;s overview.
        </p>
      </div>

      {/* KPI bento */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={BedDouble}
          label="Occupancy"
          value={occupancy}
          format={(n) => `${Math.round(n)}%`}
          hint={`${occupiedRooms} of ${totalRooms} rooms`}
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="ADR"
          value={adr}
          format={(n) => formatCurrencyPrecise(n)}
          hint="Average daily rate"
          loading={loading}
        />
        <KpiCard
          icon={LogIn}
          label="Arrivals"
          value={arrivalsToday}
          hint="Check-ins today"
          loading={loading}
        />
        <KpiCard
          icon={LogOut}
          label="Departures"
          value={departuresToday}
          hint="Check-outs today"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room status breakdown */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg tracking-tight">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            Room status
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : totalRooms === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms yet.</p>
          ) : (
            <div className="space-y-3">
              {(
                [
                  ["available", statusCounts.available],
                  ["occupied", statusCounts.occupied],
                  ["cleaning", statusCounts.cleaning],
                  ["out_of_service", statusCounts.out_of_service],
                ] as const
              ).map(([status, count]) => (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <RoomStatusBadge status={status} />
                    <span className="font-medium tabular-nums">
                      {count} / {totalRooms}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${totalRooms > 0 ? (count / totalRooms) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg tracking-tight">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Recent bookings
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/dashboard/bookings">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((booking) => (
                <RecentBookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentBookingRow({ booking }: { booking: Booking }) {
  const room = typeof booking.room === "object" ? (booking.room as Room) : null;
  const user = typeof booking.user === "object" ? (booking.user as { firstName: string; lastName: string }) : null;
  const guestName = user
    ? `${user.firstName} ${user.lastName}`
    : "Guest";

  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{guestName}</p>
        <p className="truncate text-xs text-muted-foreground">
          Room {room?.roomNumber ?? "—"} · {formatDate(booking.checkInDate)}
        </p>
      </div>
      <BookingStatusBadge status={booking.status} />
      <span className="text-sm font-medium tabular-nums">
        {formatCurrencyPrecise(booking.totalPrice)}
      </span>
    </Link>
  );
}
