"use client";

import { create } from "zustand";

/**
 * Booking draft store — holds the in-progress booking state across the
 * 4-step flow. Client-only (Zustand, no persist) — the draft is
 * intentionally ephemeral; if the user navigates away it resets.
 *
 * The store is seeded from the URL (hotelId, roomId) when the flow
 * starts, then accumulates user choices (dates, guests, special
 * requests, guest details) as they progress through the steps.
 */

export interface BookingDraft {
  hotelId: string;
  roomId: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  specialRequests: string;
  /** Guest details (step 3) — auto-filled from /me, editable. */
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface BookingStore extends BookingDraft {
  step: number;
  setStep: (step: number) => void;
  init: (hotelId: string, roomId: string) => void;
  setDates: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
  setGuests: (guests: number) => void;
  setSpecialRequests: (requests: string) => void;
  setGuestDetails: (details: Partial<Pick<BookingDraft, "firstName" | "lastName" | "email" | "phoneNumber">>) => void;
  reset: () => void;
}

const emptyDraft: Omit<BookingDraft, "hotelId" | "roomId"> = {
  checkIn: undefined,
  checkOut: undefined,
  guests: 1,
  specialRequests: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
};

export const useBookingStore = create<BookingStore>((set) => ({
  hotelId: "",
  roomId: "",
  step: 0,
  ...emptyDraft,
  setStep: (step) => set({ step }),
  init: (hotelId, roomId) =>
    set({ hotelId, roomId, step: 0, ...emptyDraft }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setGuests: (guests) => set({ guests }),
  setSpecialRequests: (specialRequests) => set({ specialRequests }),
  setGuestDetails: (details) => set(details),
  reset: () => set({ step: 0, ...emptyDraft, hotelId: "", roomId: "" }),
}));
