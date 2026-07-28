"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useHotel, useRoom, useCreateBooking } from "@/lib/query";
import { useMe } from "@/lib/query";
import { useBookingStore } from "@/lib/booking-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/primitives/skeleton";
import { EmptyState } from "@/components/primitives/empty-state";
import { BookingSummary } from "@/components/primitives/booking-summary";
import { StepProgress } from "@/components/primitives/step-progress";
import { DateRangePicker } from "@/components/primitives/date-range-picker";
import { GuestSelector } from "@/components/primitives/guest-selector";
import { Gallery } from "@/components/marketing/gallery";
import { formatCurrencyPrecise, nightsBetween } from "@/lib/format";
import type { Hotel, Room, RoomType } from "@/types/api";
import { ApiError } from "@/lib/api/apiFetch";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const STEPS = ["Dates", "Room", "Details", "Review"];

/**
 * BookingFlow — the immersive 4-step booking experience at
 * /hotels/[hotelId]/rooms/[roomId]/book.
 *
 * Step 1: Dates & guests (DateRangePicker + GuestSelector)
 * Step 2: Room & extras (gallery + specialRequests)
 * Step 3: Guest details (auto-filled from /me, editable)
 * Step 4: Review & confirm (BookingSummary + POST /api/booking)
 *
 * Sticky summary sidebar on desktop, bottom bar on mobile. StepProgress
 * with sliding active pill at the top. Animated step transitions.
 */
export function BookingFlow({
  hotelId,
  roomId,
}: {
  hotelId: string;
  roomId: string;
}) {
  const { data: hotel, isLoading: hotelLoading, isError: hotelError } = useHotel(hotelId);
  const { data: room, isLoading: roomLoading, isError: roomError } = useRoom(hotelId, roomId);
  const { data: me } = useMe();
  const createBooking = useCreateBooking();
  const router = useRouter();

  const store = useBookingStore();
  const [confirmedBookingId, setConfirmedBookingId] = React.useState<string | null>(null);

  // Seed the store with hotelId/roomId on mount, and auto-fill guest
  // details from /me when it loads.
  React.useEffect(() => {
    store.init(hotelId, roomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, roomId]);

  React.useEffect(() => {
    if (me && !store.firstName) {
      store.setGuestDetails({
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email ?? "",
        phoneNumber: me.phoneNumber ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  if (hotelError || roomError) {
    return (
      <EmptyState
        title="Couldn't load this room"
        description="This room or hotel may have been removed."
        action={
          <Button asChild size="sm">
            <Link href={`/hotels/${hotelId}`}>Back to hotel</Link>
          </Button>
        }
      />
    );
  }

  if (hotelLoading || roomLoading) {
    return <BookingFlowSkeleton />;
  }

  if (!hotel || !room) return null;

  // Success state — show after POST succeeds.
  if (confirmedBookingId) {
    return (
      <BookingSuccess
        bookingId={confirmedBookingId}
        hotelName={hotel.name}
        onGoToBooking={() =>
          router.push(`/account/bookings/${confirmedBookingId}`)
        }
      />
    );
  }

  const canProceed =
    store.step === 0
      ? !!store.checkIn && !!store.checkOut
      : store.step === 2
        ? !!store.firstName && !!store.lastName
        : true;

  const next = () => store.setStep(Math.min(store.step + 1, STEPS.length - 1));
  const back = () => store.setStep(Math.max(store.step - 1, 0));

  const onConfirm = async () => {
    if (!store.checkIn || !store.checkOut) return;
    try {
      const res = await createBooking.mutateAsync({
        hotelId: store.hotelId,
        roomId: store.roomId,
        checkInDate: store.checkIn.toISOString(),
        checkOutDate: store.checkOut.toISOString(),
        numberOfGuests: store.guests,
        specialRequests: store.specialRequests || undefined,
      });
      setConfirmedBookingId(res.booking.id);
      toast.success("Booking confirmed!");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not complete booking. Please try again."
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href={`/hotels/${hotelId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {hotel.name}
      </Link>

      {/* Step progress */}
      <StepProgress steps={STEPS} current={store.step} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main: step content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={store.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.15, 1] as const }}
            >
              {store.step === 0 ? (
                <StepDates
                  checkIn={store.checkIn}
                  checkOut={store.checkOut}
                  guests={store.guests}
                  onDatesChange={(from, to) => store.setDates(from, to)}
                  onGuestsChange={store.setGuests}
                />
              ) : store.step === 1 ? (
                <StepRoom room={room} />
              ) : store.step === 2 ? (
                <StepDetails
                  firstName={store.firstName}
                  lastName={store.lastName}
                  email={store.email}
                  phoneNumber={store.phoneNumber}
                  onChange={store.setGuestDetails}
                />
              ) : (
                <StepReview
                  hotel={hotel}
                  room={room}
                  checkIn={store.checkIn}
                  checkOut={store.checkOut}
                  guests={store.guests}
                  specialRequests={store.specialRequests}
                  firstName={store.firstName}
                  lastName={store.lastName}
                  email={store.email}
                  phoneNumber={store.phoneNumber}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={back}
              disabled={store.step === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {store.step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canProceed} className="gap-1.5">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onConfirm}
                disabled={createBooking.isPending}
                className="shine-sweep gap-1.5"
              >
                {createBooking.isPending ? "Confirming…" : "Confirm booking"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar: persistent summary (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BookingSummary
              hotel={hotel}
              room={room}
              checkIn={store.checkIn}
              checkOut={store.checkOut}
              guests={store.guests}
              specialRequests={store.specialRequests}
            />
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-md lg:hidden">
        <BookingSummary
          hotel={hotel}
          room={room}
          checkIn={store.checkIn}
          checkOut={store.checkOut}
          guests={store.guests}
          specialRequests={store.specialRequests}
        />
      </div>
    </div>
  );
}

/* --- Step 1: Dates & guests --------------------------------------------- */
function StepDates({
  checkIn,
  checkOut,
  guests,
  onDatesChange,
  onGuestsChange,
}: {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  onDatesChange: (from: Date | undefined, to: Date | undefined) => void;
  onGuestsChange: (guests: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = checkIn || checkOut ? { from: checkIn, to: checkOut } : undefined;
  const label =
    checkIn && checkOut
      ? `${format(checkIn, "MMM d")} → ${format(checkOut, "MMM d")}`
      : "Select dates";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">When are you coming?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your check-in and check-out dates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Dates</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 font-normal"
              >
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker
                selected={selected}
                onSelect={(range) => {
                  onDatesChange(range?.from, range?.to);
                  if (range?.from && range?.to) setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Guests</Label>
          <GuestSelector value={guests} onChange={onGuestsChange} />
        </div>

        {checkIn && checkOut ? (
          <p className="text-sm text-muted-foreground">
            {nightsBetween(checkIn, checkOut)}{" "}
            {nightsBetween(checkIn, checkOut) === 1 ? "night" : "nights"}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* --- Step 2: Room & extras ---------------------------------------------- */
function StepRoom({ room }: { room: Room }) {
  const roomType =
    typeof room.roomType === "object" ? (room.roomType as RoomType) : null;
  const images = [
    ...(room.images ?? []),
    ...(roomType?.images ?? []),
  ];
  const amenities = [
    ...(room.amenities ?? []),
    ...(roomType?.amenities ?? []),
  ];
  const price = room.pricePerNight ?? roomType?.basePrice;
  const [requests, setRequests] = useBookingStore((s) => [s.specialRequests, s.setSpecialRequests]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Your room</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the room and add any special requests.
        </p>
      </div>

      <Gallery
        images={images}
        name={`Room ${room.roomNumber}`}
        className="max-w-2xl"
      />

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-display text-lg tracking-tight">
            Room {room.roomNumber}
          </h3>
          {roomType ? (
            <p className="text-sm text-muted-foreground">{roomType.name}</p>
          ) : null}
          {roomType?.description ? (
            <p className="mt-3 text-sm text-foreground/90">
              {roomType.description}
            </p>
          ) : null}
          {amenities.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
          {price != null ? (
            <p className="mt-4 text-sm">
              <span className="font-display text-xl text-foreground">
                {formatCurrencyPrecise(price)}
              </span>
              <span className="text-muted-foreground"> / night</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special requests (optional)</Label>
          <Textarea
            id="specialRequests"
            placeholder="Late check-in, extra pillows, accessibility needs…"
            maxLength={1000}
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {requests.length}/1000 characters
          </p>
        </div>
      </div>
    </section>
  );
}

/* --- Step 3: Guest details ---------------------------------------------- */
function StepDetails({
  firstName,
  lastName,
  email,
  phoneNumber,
  onChange,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  onChange: (details: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string }) => void;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Your details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll use these to confirm your booking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}

/* --- Step 4: Review ----------------------------------------------------- */
function StepReview({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  specialRequests,
  firstName,
  lastName,
  email,
  phoneNumber,
}: {
  hotel: Hotel;
  room: Room;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  specialRequests: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Review & confirm</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your booking before confirming.
        </p>
      </div>

      <div className="space-y-4">
        {/* Guest */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Guest
          </h3>
          <p className="font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-sm text-muted-foreground">{email}</p>
          {phoneNumber ? (
            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
          ) : null}
        </div>

        {/* Stay */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Stay
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hotel</dt>
              <dd className="font-medium">{hotel.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="font-medium">
                Room {room.roomNumber}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Check-in</dt>
              <dd className="font-medium">
                {checkIn ? format(checkIn, "MMM d, yyyy") : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Check-out</dt>
              <dd className="font-medium">
                {checkOut ? format(checkOut, "MMM d, yyyy") : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Guests</dt>
              <dd className="font-medium">{guests}</dd>
            </div>
            {specialRequests ? (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">Requests</dt>
                <dd className="text-right font-medium">{specialRequests}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* --- Success state ------------------------------------------------------ */
function BookingSuccess({
  bookingId,
  hotelName,
  onGoToBooking,
}: {
  bookingId: string;
  hotelName: string;
  onGoToBooking: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <Check className="h-8 w-8" />
      </motion.div>
      <h1 className="mt-6 font-display text-3xl tracking-tight">
        Booking confirmed
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Your stay at {hotelName} is booked. We&apos;ve saved your confirmation —
        you can review it anytime in your bookings.
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Ref: {bookingId}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={onGoToBooking}>View booking</Button>
        <Button asChild variant="outline">
          <Link href="/account">My bookings</Link>
        </Button>
      </div>
    </div>
  );
}

/* --- Skeleton ----------------------------------------------------------- */
function BookingFlowSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-full max-w-md" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
