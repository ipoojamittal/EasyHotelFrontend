"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useBooking,
  useUpdateBookingStatus,
  useUpdateBookingDetails,
  useCancelBooking,
} from "@/lib/query";
import type { Booking, Hotel, Room, User, BookingStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { ConfirmDialog } from "@/components/primitives/confirm-dialog";
import { StatusStepper } from "@/components/primitives/status-stepper";
import { BookingStatusBadge } from "@/components/primitives/status-badge";
import {
  formatCurrencyPrecise,
  formatDate,
  nightsBetween,
} from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { CalendarDays, Pencil, X, ArrowLeft } from "lucide-react";

/**
 * BookingDetail — the /dashboard/bookings/[id] page. Shows full booking
 * info with a StatusStepper (PATCH /:id/status), edit details
 * (PATCH /:id — dates/guests), and cancel (PATCH /:id/cancel).
 */
export function BookingDetail({ bookingId }: { bookingId: string }) {
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const updateDetails = useUpdateBookingDetails();
  const cancelBooking = useCancelBooking();
  const router = useRouter();

  const [editing, setEditing] = React.useState(false);

  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Booking not found"
        description={error instanceof ApiError ? error.message : "It may have been removed."}
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/bookings">Back to bookings</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading || !booking) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const guest = typeof booking.user === "object" ? (booking.user as User) : null;
  const hotel = typeof booking.hotel === "object" ? (booking.hotel as Hotel) : null;
  const room = typeof booking.room === "object" ? (booking.room as Room) : null;
  const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
  const isTerminal =
    booking.status === "cancelled" || booking.status === "no-show";

  const onAdvance = async (next: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ bookingId, status: next });
      toast.success(`Status → ${next.replace(/-/g, " ")}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update status.");
    }
  };

  const onCancel = async () => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel.");
      throw err;
    }
  };

  return (
    <div className="space-y-8">
      {/* Back + title */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => router.push("/dashboard/bookings")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to bookings
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-tight">
              Booking <span className="font-mono text-lg text-muted-foreground">{booking.id.slice(-8)}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {guest ? `${guest.firstName} ${guest.lastName}` : "—"} · {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Status stepper */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-lg tracking-tight">Lifecycle</h2>
        <StatusStepper
          current={booking.status}
          onAdvance={onAdvance}
          disabled={updateStatus.isPending || isTerminal}
        />
        {!isTerminal ? (
          <div className="mt-4 flex items-center gap-3">
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                  <X className="h-3.5 w-3.5" />
                  Cancel booking
                </Button>
              }
              title="Cancel this booking?"
              description="This marks the booking as cancelled. The guest will be notified. This cannot be undone."
              confirmLabel="Cancel booking"
              destructive
              onConfirm={onCancel}
            />
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {editing ? (
            <EditDetailsForm
              booking={booking}
              onSubmit={async (v) => {
                try {
                  await updateDetails.mutateAsync({ bookingId, payload: v });
                  toast.success("Details updated.");
                  setEditing(false);
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.message : "Could not update.");
                }
              }}
              onCancel={() => setEditing(false)}
              submitting={updateDetails.isPending}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg tracking-tight">Details</h2>
                {!isTerminal ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                ) : null}
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Check-in" value={formatDate(booking.checkInDate)} />
                <Detail label="Check-out" value={formatDate(booking.checkOutDate)} />
                <Detail label="Nights" value={String(nights)} />
                <Detail label="Guests" value={String(booking.numberOfGuests)} />
                <Detail label="Total price" value={formatCurrencyPrecise(booking.totalPrice)} />
                <Detail label="Created" value={formatDate(booking.createdAt ?? "")} />
              </dl>
              {booking.specialRequests ? (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Special requests</p>
                  <p className="mt-1 text-sm">{booking.specialRequests}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {guest ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-3 font-display text-lg tracking-tight">Guest</h2>
              <dl className="space-y-2 text-sm">
                <Detail label="Name" value={`${guest.firstName} ${guest.lastName}`} />
                {guest.email ? <Detail label="Email" value={guest.email} /> : null}
                {guest.phoneNumber ? <Detail label="Phone" value={guest.phoneNumber} /> : null}
              </dl>
            </div>
          ) : null}
          {hotel ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-3 font-display text-lg tracking-tight">Hotel</h2>
              <p className="text-sm font-medium">{hotel.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hotel.address.city}, {hotel.address.country}
              </p>
            </div>
          ) : null}
          {room ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-3 font-display text-lg tracking-tight">Room</h2>
              <dl className="space-y-2 text-sm">
                <Detail label="Number" value={room.roomNumber} />
                <Detail
                  label="Type"
                  value={
                    typeof room.roomType === "object"
                      ? (room.roomType as { name: string }).name
                      : "—"
                  }
                />
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* --- edit details form ---------------------------------------------------- */

function EditDetailsForm({
  booking,
  onSubmit,
  onCancel,
  submitting,
}: {
  booking: Booking;
  onSubmit: (v: { checkInDate?: string; checkOutDate?: string; numberOfGuests?: number }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [checkInDate, setCheckInDate] = React.useState(
    booking.checkInDate.slice(0, 10)
  );
  const [checkOutDate, setCheckOutDate] = React.useState(
    booking.checkOutDate.slice(0, 10)
  );
  const [numberOfGuests, setNumberOfGuests] = React.useState(
    String(booking.numberOfGuests)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      numberOfGuests: Number(numberOfGuests) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-lg tracking-tight">Edit details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="checkInDate">Check-in date</Label>
          <Input
            id="checkInDate"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOutDate">Check-out date</Label>
          <Input
            id="checkOutDate"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="numberOfGuests">Number of guests</Label>
        <Input
          id="numberOfGuests"
          type="number"
          min="1"
          max="20"
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
