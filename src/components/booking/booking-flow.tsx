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
 * Step 4: Review & confirm (BookingSummary + POST /api/bookings)
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
  // Stable selectors for effect dependencies (Zustand actions are stable refs).
  const initStore = useBookingStore((s) => s.init);
  const setGuestDetails = useBookingStore((s) => s.setGuestDetails);
  const storeFirstName = useBookingStore((s) => s.firstName);
  const [confirmedBookingId, setConfirmedBookingId] = React.useState<string | null>(null);

  // Seed the store with hotelId/roomId on mount, and auto-fill guest
  // details from /me when it loads.
  React.useEffect(() => {
    initStore(hotelId, roomId);
  }, [initStore, hotelId, roomId]);

  React.useEffect(() => {
    if (me && !storeFirstName) {
      setGuestDetails({
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email ?? "",
        phoneNumber: me.phoneNumber ?? "",
      });
    }
  }, [me, storeFirstName, setGuestDetails]);

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
    <div className="mx-auto max-w-7xl">
      {/* Header bar: back link + stepper */}
      <div className="mb-10 flex flex-col gap-6">
        <Link
          href={`/hotels/${hotelId}`}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {hotel.name}
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <StepProgress steps={STEPS} current={store.step} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main: step content */}
        <div className="lg:col-span-8">
          <div className="min-h-[28rem] overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
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
          </div>

          {/* Nav buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={back}
              disabled={store.step === 0}
              size="lg"
              className="gap-2 px-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {store.step < STEPS.length - 1 ? (
              <Button
                onClick={next}
                disabled={!canProceed}
                size="lg"
                className="gap-2 px-8"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onConfirm}
                disabled={createBooking.isPending}
                size="lg"
                className="gap-2 bg-emerald-600 px-8 hover:bg-emerald-700"
              >
                {createBooking.isPending ? "Confirming…" : "Confirm booking"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar: persistent summary (desktop) */}
        <aside className="hidden lg:col-span-4 lg:block">
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

  const checkInLabel = checkIn ? format(checkIn, "EEEE, MMM d") : "Select check-in";
  const checkOutLabel = checkOut ? format(checkOut, "EEEE, MMM d") : "Select check-out";
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">When are you coming?</h2>
        <p className="text-muted-foreground">
          Choose your check-in and check-out dates to get started.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dates trigger */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Stay dates</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex h-auto w-full items-center justify-between rounded-xl border border-border bg-muted/30 p-4 font-normal transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">{nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} selected` : "Pick your dates"}</p>
                    <p className="text-base font-medium">
                      {checkIn && checkOut
                        ? `${format(checkIn, "MMM d")} — ${format(checkOut, "MMM d")}`
                        : checkInLabel}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  Change
                </span>
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

          {checkIn && checkOut ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Check-in</p>
                <p className="mt-1 font-medium">{checkInLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Check-out</p>
                <p className="mt-1 font-medium">{checkOutLabel}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-muted-foreground">
                <p className="text-xs uppercase tracking-[0.1em]">Check-in</p>
                <p className="mt-1 text-sm">Not selected</p>
              </div>
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-muted-foreground">
                <p className="text-xs uppercase tracking-[0.1em]">Check-out</p>
                <p className="mt-1 text-sm">Not selected</p>
              </div>
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Guests</Label>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex-1">
              <p className="font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p>
              <p className="text-xs text-muted-foreground">Adults staying in the room</p>
            </div>
            <GuestSelector value={guests} onChange={onGuestsChange} />
          </div>
        </div>
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
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Your room</h2>
        <p className="text-muted-foreground">
          Review the room and add any special requests.
        </p>
      </div>

      <Gallery
        images={images}
        name={`Room ${room.roomNumber}`}
        className="max-w-2xl"
      />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-muted/50 p-5">
            <h3 className="font-display text-xl tracking-tight">
              Room {room.roomNumber}
            </h3>
            {roomType ? (
              <p className="text-sm text-muted-foreground">{roomType.name}</p>
            ) : null}
          </div>
          <div className="p-5">
            {roomType?.description ? (
              <p className="text-sm text-foreground/90 leading-relaxed">
                {roomType.description}
              </p>
            ) : null}
            {amenities.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}
            {price != null ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-display text-2xl font-medium text-foreground">
                    {formatCurrencyPrecise(price)}
                  </span>
                  <span> / night</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="specialRequests" className="text-sm font-semibold">Special requests <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea
            id="specialRequests"
            placeholder="Late check-in, extra pillows, accessibility needs…"
            maxLength={1000}
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
            rows={5}
            className="rounded-xl"
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
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Your details</h2>
        <p className="text-muted-foreground">
          We&apos;ll use these to confirm your booking.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-semibold">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="h-12 rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-semibold">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="h-12 rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="h-12 rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
            className="h-12 rounded-xl"
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
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl tracking-tight">Review & confirm</h2>
        <p className="text-muted-foreground">
          Please review your booking before confirming.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Guest */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Guest
            </p>
          </div>
          <div className="p-5">
            <p className="font-display text-lg font-medium">
              {firstName} {lastName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            {phoneNumber ? (
              <p className="mt-1 text-sm text-muted-foreground">{phoneNumber}</p>
            ) : null}
          </div>
        </div>

        {/* Stay */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Stay
            </p>
          </div>
          <div className="p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Hotel</dt>
                <dd className="font-medium text-right">{hotel.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Room</dt>
                <dd className="font-medium text-right">
                  Room {room.roomNumber}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Check-in</dt>
                <dd className="font-medium text-right">
                  {checkIn ? format(checkIn, "MMM d, yyyy") : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Check-out</dt>
                <dd className="font-medium text-right">
                  {checkOut ? format(checkOut, "MMM d, yyyy") : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Guests</dt>
                <dd className="font-medium text-right">{guests}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Special requests */}
        {specialRequests ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card sm:col-span-2">
            <div className="bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Special requests
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-foreground/90 leading-relaxed">{specialRequests}</p>
            </div>
          </div>
        ) : null}
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
      >
        <Check className="h-10 w-10" strokeWidth={2.5} />
      </motion.div>
      <h1 className="mt-6 font-display text-4xl tracking-tight">
        Booking confirmed
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Your stay at {hotelName} is booked. We&apos;ve saved your confirmation —
        you can review it anytime in your bookings.
      </p>
      <p className="mt-4 font-mono text-sm text-muted-foreground">
        Ref: {bookingId}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onGoToBooking} size="lg" className="gap-2">
          View booking
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/account">My bookings</Link>
        </Button>
      </div>
    </div>
  );
}

/* --- Skeleton ----------------------------------------------------------- */
function BookingFlowSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-[28rem] w-full rounded-2xl" />
          <div className="flex justify-between">
            <Skeleton className="h-12 w-28 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-4" />
      </div>
    </div>
  );
}
