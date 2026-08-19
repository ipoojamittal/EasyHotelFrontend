"use client";

import * as React from "react";
import { formatCurrencyPrecise, formatDate, nightsBetween } from "@/lib/format";
import type { Hotel, Room, RoomType } from "@/types/api";

/**
 * BookingSummary — the persistent sidebar showing the booking's key
 * details + price breakdown. Used in the booking flow (desktop sidebar,
 * mobile bottom bar) and on the confirm step.
 */
export function BookingSummary({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  specialRequests,
}: {
  hotel: Hotel | null;
  room: Room | null;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  specialRequests?: string;
}) {
  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const roomType =
    room && typeof room.roomType === "object"
      ? (room.roomType as RoomType)
      : null;
  const pricePerNight = room?.pricePerNight ?? roomType?.basePrice ?? 0;
  const total = pricePerNight * nights;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="bg-muted/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Booking summary
        </p>
      </div>

      <div className="p-5">
        {/* Hotel + room */}
        {hotel ? (
          <div className="mb-5 space-y-1 border-b border-border pb-5">
            <p className="font-display text-xl leading-tight tracking-tight">
              {hotel.name}
            </p>
            {room ? (
              <p className="text-sm text-muted-foreground">
                Room {room.roomNumber}
                {roomType ? ` · ${roomType.name}` : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Dates */}
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Check-in</dt>
            <dd className="font-medium">
              {checkIn ? formatDate(checkIn) : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Check-out</dt>
            <dd className="font-medium">
              {checkOut ? formatDate(checkOut) : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="font-medium">
              {guests} {guests === 1 ? "guest" : "guests"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nights</dt>
            <dd className="font-medium">{nights || "—"}</dd>
          </div>
        </dl>

        {/* Special requests */}
        {specialRequests ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Special requests
            </p>
            <p className="mt-1 text-sm text-foreground/90 line-clamp-3">
              {specialRequests}
            </p>
          </div>
        ) : null}

        {/* Price breakdown */}
        <div className="mt-5 border-t border-border pt-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {formatCurrencyPrecise(pricePerNight)} × {nights || 0} nights
              </span>
              <span>{formatCurrencyPrecise(total)}</span>
            </div>
            <div className="flex items-end justify-between text-foreground">
              <span className="text-sm font-medium">Total</span>
              <span className="font-display text-2xl tracking-tight">
                {formatCurrencyPrecise(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
