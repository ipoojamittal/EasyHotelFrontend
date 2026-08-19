"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useRooms,
  useCreateBookingOnBehalf,
} from "@/lib/query";
import type { RoomType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/apiFetch";
import { CalendarDays, Save } from "lucide-react";

/**
 * NewBookingForm — the /dashboard/bookings/new page. Staff/hotelAdmin
 * create a booking on behalf of a customer (POST /api/bookings/hotel).
 *
 * Fields: customerId, roomId, checkInDate, checkOutDate, numberOfGuests,
 * specialRequests.
 */
export function NewBookingForm() {
  const { user } = useAuth();
  const hotelId = user?.hotelId ?? "";
  const router = useRouter();
  const createOnBehalf = useCreateBookingOnBehalf();

  const { data: rooms, isLoading } = useRooms(hotelId, { limit: 100, status: "available" });

  const [customerId, setCustomerId] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const [checkInDate, setCheckInDate] = React.useState("");
  const [checkOutDate, setCheckOutDate] = React.useState("");
  const [numberOfGuests, setNumberOfGuests] = React.useState("1");
  const [specialRequests, setSpecialRequests] = React.useState("");

  if (!hotelId) {
    return (
      <div className="space-y-8">
        <Header />
        <EmptyState
          icon={CalendarDays}
          title="No hotel assigned"
          description="Your account isn't linked to a hotel."
        />
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim()) {
      toast.error("Customer ID is required.");
      return;
    }
    if (!roomId) {
      toast.error("Select a room.");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      toast.error("Select check-in and check-out dates.");
      return;
    }
    try {
      const result = await createOnBehalf.mutateAsync({
        customerId: customerId.trim(),
        hotelId,
        roomId,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        numberOfGuests: Number(numberOfGuests) || 1,
        specialRequests: specialRequests.trim() || undefined,
      });
      toast.success("Booking created.");
      router.push(`/dashboard/bookings/${result.booking.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create booking.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <Header />

      {/* Customer */}
      <Section title="Customer" description="The guest this booking is for.">
        <div className="space-y-2">
          <Label>
            Customer ID<span className="text-destructive"> *</span>
          </Label>
          <Input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="e.g. 6655a1b2c3d4e5f6a7b8c9d0"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Paste the customer&apos;s user ID. (A customer lookup will be added in a future pass.)
          </p>
        </div>
      </Section>

      {/* Stay */}
      <Section title="Stay" description="Room and dates.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Room<span className="text-destructive"> *</span>
            </Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available room" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="_loading" disabled>
                    Loading…
                  </SelectItem>
                ) : (rooms ?? []).length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No available rooms
                  </SelectItem>
                ) : (
                  (rooms ?? []).map((room) => {
                    const rt =
                      typeof room.roomType === "object"
                        ? (room.roomType as RoomType)
                        : null;
                    const price = room.pricePerNight ?? rt?.basePrice;
                    return (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber}
                        {rt ? ` · ${rt.name}` : ""}
                        {price != null ? ` · ${formatCurrency(price)}/night` : ""}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Guests</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Check-in<span className="text-destructive"> *</span>
            </Label>
            <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>
              Check-out<span className="text-destructive"> *</span>
            </Label>
            <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Special requests</Label>
          <Textarea
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Optional notes from the guest…"
            maxLength={1000}
          />
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={createOnBehalf.isPending} className="gap-1.5">
          <Save className="h-4 w-4" />
          {createOnBehalf.isPending ? "Creating…" : "Create booking"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/bookings")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">New booking</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create a reservation on behalf of a customer.
      </p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
