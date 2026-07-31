"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useHotelBookings } from "@/lib/query";
import type { BookingStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { BookingStatusBadge } from "@/components/primitives/status-badge";
import { formatCurrencyPrecise, formatDate, nightsBetween } from "@/lib/format";
import { CalendarDays, Plus, ArrowRight } from "lucide-react";

const STATUS_FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked-in", label: "Checked in" },
  { value: "checked-out", label: "Checked out" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no-show", label: "No-show" },
];

/**
 * BookingsList — the /dashboard/bookings page. A DataTable of the hotel's
 * bookings with a status filter. Each row links to the detail page.
 */
export function BookingsList() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "all">("all");

  const { data: bookingsData, isLoading, isError } = useHotelBookings(hotelId, {
    limit: 100,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  });

  if (!hotelId) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={CalendarDays}
          title="No hotel assigned"
          description="Your account isn't linked to a hotel. Please contact an administrator."
        />
      </div>
    );
  }

  const bookings = bookingsData?.bookings ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <Header />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/dashboard/bookings/new">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Status</span>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | "all")}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings yet"
          description="Bookings will appear here once guests start reserving rooms."
          action={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard/bookings/new">
                <Plus className="h-4 w-4" />
                New booking
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="w-40">Dates</TableHead>
                <TableHead className="w-16 text-right">Nights</TableHead>
                <TableHead className="w-28 text-right">Total</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-16 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const guestName =
                  typeof b.user === "object"
                    ? `${b.user.firstName} ${b.user.lastName}`
                    : "—";
                const roomNumber =
                  typeof b.room === "object" ? b.room.roomNumber : "—";
                const nights = nightsBetween(b.checkInDate, b.checkOutDate);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{guestName}</TableCell>
                    <TableCell className="font-mono text-sm">{roomNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{nights}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrencyPrecise(b.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link href={`/dashboard/bookings/${b.id}`} aria-label="View">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Bookings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All reservations for your hotel. Filter by status to triage the day.
      </p>
    </div>
  );
}
