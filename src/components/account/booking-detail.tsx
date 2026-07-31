"use client";

import * as React from "react";
import Link from "next/link";
import { useBooking, useCancelBooking } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { BookingStatusBadge } from "@/components/primitives/status-badge";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { formatCurrencyPrecise, formatDate, nightsBetween } from "@/lib/format";
import type { Hotel, Room } from "@/types/api";
import { ApiError } from "@/lib/api/apiFetch";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  BedDouble,
  MapPin,
  Phone,
  Mail,
  Clock,
  Info,
} from "lucide-react";

/**
 * BookingDetail — the /account/bookings/[id] page. Shows full booking
 * info (hotel, room, dates, guests, price, status, special requests),
 * hotel contact details, and a Cancel button.
 */
export function BookingDetail({ bookingId }: { bookingId: string }) {
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const cancelMutation = useCancelBooking();

  if (isError) {
    return (
      <EmptyState
        title="Booking not found"
        description="This booking may have been removed or the link is incorrect."
        action={
          <Button asChild size="sm">
            <Link href="/account">Back to my bookings</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading || !booking) {
    return <BookingDetailSkeleton />;
  }

  const hotel = typeof booking.hotel === "object" ? (booking.hotel as Hotel) : null;
  const room = typeof booking.room === "object" ? (booking.room as Room) : null;
  const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "checked-out" &&
    booking.status !== "no-show";

  const onCancel = async () => {
    try {
      await cancelMutation.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not cancel. Please try again."
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All bookings
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl tracking-tight">
              {hotel?.name ?? "Your booking"}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Ref: {booking.id}
          </p>
        </div>
        {canCancel ? (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="text-destructive">
                Cancel booking
              </Button>
            }
            title="Cancel this booking?"
            description="This action cannot be undone. Cancellation policies may apply."
            confirmLabel="Yes, cancel"
            destructive
            onConfirm={onCancel}
          />
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main: stay details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dates & guests */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg tracking-tight">
              Stay details
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailRow
                icon={CalendarDays}
                label="Check-in"
                value={formatDate(booking.checkInDate)}
              />
              <DetailRow
                icon={CalendarDays}
                label="Check-out"
                value={formatDate(booking.checkOutDate)}
              />
              <DetailRow
                icon={Clock}
                label="Duration"
                value={`${nights} ${nights === 1 ? "night" : "nights"}`}
              />
              <DetailRow
                icon={Users}
                label="Guests"
                value={`${booking.numberOfGuests} ${booking.numberOfGuests === 1 ? "guest" : "guests"}`}
              />
              {room ? (
                <DetailRow
                  icon={BedDouble}
                  label="Room"
                  value={`Room ${room.roomNumber}`}
                />
              ) : null}
            </dl>
          </section>

          {/* Special requests */}
          {booking.specialRequests ? (
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-3 font-display text-lg tracking-tight">
                Special requests
              </h2>
              <p className="text-sm text-foreground/90">
                {booking.specialRequests}
              </p>
            </section>
          ) : null}

          {/* Price breakdown */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg tracking-tight">
              Price summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {formatCurrencyPrecise(
                    room?.pricePerNight ?? 0
                  )}{" "}
                  × {nights} {nights === 1 ? "night" : "nights"}
                </span>
                <span>{formatCurrencyPrecise(booking.totalPrice)}</span>
              </div>
              <div className="border-t border-border pt-2 font-medium text-foreground">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-display text-lg">
                    {formatCurrencyPrecise(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: hotel contact */}
        {hotel ? (
          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Hotel contact
              </h3>
              <dl className="space-y-3 text-sm">
                {hotel.address ? (
                  <DetailRow
                    icon={MapPin}
                    label="Address"
                    value={[
                      hotel.address.street,
                      hotel.address.city,
                      hotel.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                ) : null}
                {hotel.phoneNumber?.length ? (
                  <DetailRow
                    icon={Phone}
                    label="Phone"
                    value={hotel.phoneNumber[0]}
                  />
                ) : null}
                {hotel.email ? (
                  <DetailRow icon={Mail} label="Email" value={hotel.email} />
                ) : null}
              </dl>
            </div>

            {booking.status === "cancelled" ? (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This booking was cancelled. Contact the hotel for
                  rebooking.
                </p>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}
