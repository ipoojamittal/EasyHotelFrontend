"use client";

import * as React from "react";
import Link from "next/link";
import { useHotel, useRooms } from "@/lib/query";
import { Gallery } from "./gallery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { RoomStatusBadge } from "@/components/primitives/status-badge";
import { formatCurrency } from "@/lib/format";
import type { Room, RoomType } from "@/types/api";
import { MapPin, Clock, Phone, Mail, CheckCircle2, BedDouble } from "lucide-react";

/**
 * HotelDetail — the /hotels/[hotelId] page content. Fetches the hotel +
 * its rooms via TanStack Query, renders a hero gallery, hotel info
 * (amenities, address, check-in/out, contact), and a room list.
 *
 * Each room card shows image, type, capacity, price, status, and a
 * "Reserve" link (the booking flow ships in Phase 2).
 */
export function HotelDetail({ hotelId }: { hotelId: string }) {
  const { data: hotel, isLoading: hotelLoading, isError: hotelError } = useHotel(hotelId);
  const { data: rooms, isLoading: roomsLoading } = useRooms(hotelId, {
    isDeleted: false,
    limit: 100,
  });

  if (hotelError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <EmptyState
          title="Hotel not found"
          description="This property may have been removed or the link is incorrect."
          action={
            <Button asChild size="sm">
              <Link href="/hotels">Browse all stays</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (hotelLoading) {
    return <HotelDetailSkeleton />;
  }

  if (!hotel) return null;

  const location = [
    hotel.address?.street,
    hotel.address?.city,
    hotel.address?.state,
    hotel.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/hotels" className="hover:text-foreground">
          ← All stays
        </Link>
      </nav>

      {/* Title + location */}
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {hotel.name}
        </h1>
        {location ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {location}
          </p>
        ) : null}
      </div>

      {/* Gallery */}
      <Gallery images={hotel.images ?? []} name={hotel.name} className="mb-12" />

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main column: description + rooms */}
        <div className="space-y-12 lg:col-span-2">
          {hotel.description ? (
            <section>
              <h2 className="mb-4 font-display text-xl tracking-tight">
                About this property
              </h2>
              <p className="text-base leading-relaxed text-foreground/90">
                {hotel.description}
              </p>
            </section>
          ) : null}

          {/* Rooms */}
          <section>
            <h2 className="mb-6 font-display text-xl tracking-tight">
              Available rooms
            </h2>
            {roomsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} hotelId={hotelId} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BedDouble}
                title="No rooms listed yet"
                description="This property hasn't added any rooms. Check back soon."
              />
            )}
          </section>
        </div>

        {/* Sidebar: info + amenities */}
        <aside className="space-y-6">
          {/* Stay details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Stay details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Check-in</dt>
                  <dd className="font-medium">{hotel.checkInTime || "—"}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Check-out</dt>
                  <dd className="font-medium">{hotel.checkOutTime || "—"}</dd>
                </div>
              </div>
              {hotel.phoneNumber?.length ? (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{hotel.phoneNumber[0]}</dd>
                  </div>
                </div>
              ) : null}
              {hotel.email ? (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{hotel.email}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </div>

          {/* Amenities */}
          {hotel.amenities?.length ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Amenities
              </h3>
              <ul className="space-y-2">
                {hotel.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

/**
 * RoomCard — a single room in the hotel detail room list. Shows image,
 * type, capacity, price, status, and a "Reserve" button.
 *
 * Only out_of_service rooms are unbookable. Rooms that are currently
 * occupied or cleaning can still be reserved for future dates — the
 * backend's overlap check handles real availability.
 */
function RoomCard({ room, hotelId }: { room: Room; hotelId: string }) {
  const roomType =
    typeof room.roomType === "object" ? (room.roomType as RoomType) : null;
  const name = roomType?.name ?? "Room";
  const price = room.pricePerNight ?? roomType?.basePrice;
  const capacity = room.capacity ?? roomType?.defaultCapacity;
  const image =
    room.images?.[0] ?? roomType?.images?.[0] ?? null;
  const isBookable = room.status !== "out_of_service";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted sm:h-32 sm:w-48 sm:shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 to-muted" />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight tracking-tight">
              Room {room.roomNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {capacity ? (
            <span>Up to {capacity} guests</span>
          ) : null}
          {roomType?.bedConfiguration ? (
            <span>{roomType.bedConfiguration}</span>
          ) : null}
          {roomType?.viewType ? (
            <span>{roomType.viewType} view</span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          {price != null ? (
            <p className="text-sm">
              <span className="font-display text-xl text-foreground">
                {formatCurrency(price)}
              </span>
              <span className="text-muted-foreground"> / night</span>
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">Price on request</span>
          )}
          <Button
            asChild
            size="sm"
            disabled={!isBookable}
            aria-disabled={!isBookable}
          >
            <Link
              href={`/hotels/${hotelId}/rooms/${room.id}/book`}
              aria-disabled={!isBookable}
              className={
                !isBookable ? "pointer-events-none opacity-50" : ""
              }
            >
              {isBookable ? "Reserve" : "Out of service"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function HotelDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-3 h-12 w-2/3" />
      <Skeleton className="mb-8 h-5 w-1/2" />
      <Skeleton className="mb-12 h-[400px] w-full rounded-lg" />
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
