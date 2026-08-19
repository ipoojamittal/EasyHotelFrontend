"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  bookingsApi,
  type CreateBookingPayload,
  type CreateBookingOnBehalfPayload,
  type ListBookingsParams,
  type UpdateBookingDetailsPayload,
} from "@/lib/api/bookings";
import type { BookingStatus } from "@/types/api";
import { bookingsKeys } from "@/lib/query/keys";

/** Customer: their own bookings (paginated, filterable by status). */
export function useMyBookings(params: ListBookingsParams = {}) {
  return useQuery({
    queryKey: bookingsKeys.mine(params as Record<string, unknown>),
    queryFn: () => bookingsApi.listMine(params),
  });
}

/** Staff/admin: all bookings for a hotel. */
export function useHotelBookings(hotelId: string, params: ListBookingsParams = {}) {
  return useQuery({
    queryKey: bookingsKeys.hotel(hotelId, params as Record<string, unknown>),
    queryFn: () => bookingsApi.listForHotel(hotelId, params),
    enabled: !!hotelId,
  });
}

/** Single booking detail (shared by customer + staff). */
export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: bookingsKeys.detail(bookingId),
    queryFn: () => bookingsApi.get(bookingId),
    enabled: !!bookingId,
  });
}

/** Customer: create a booking. Invalidates their list. */
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingsKeys.mine() });
    },
  });
}

/** Staff/admin: create a booking on behalf of a customer. */
export function useCreateBookingOnBehalf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingOnBehalfPayload) =>
      bookingsApi.createOnBehalf(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: bookingsKeys.hotel(variables.hotelId) });
    },
  });
}

/** Staff/admin: update booking dates/guests. */
export function useUpdateBookingDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: UpdateBookingDetailsPayload;
    }) => bookingsApi.updateDetails(bookingId, payload),
    onSuccess: (data, variables) => {
      qc.setQueryData(bookingsKeys.detail(variables.bookingId), data.booking);
      qc.invalidateQueries({ queryKey: bookingsKeys.mine() });
      qc.invalidateQueries({ queryKey: ["bookings", "hotel"] });
    },
  });
}

/** Staff/admin: update booking status (confirmed → checked-in → …). */
export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => bookingsApi.updateStatus(bookingId, status),
    onSuccess: (data, variables) => {
      qc.setQueryData(bookingsKeys.detail(variables.bookingId), data.booking);
      qc.invalidateQueries({ queryKey: bookingsKeys.mine() });
      qc.invalidateQueries({ queryKey: ["bookings", "hotel"] });
    },
  });
}

/** Customer or staff: cancel a booking. */
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
    onSuccess: (data, bookingId) => {
      qc.setQueryData(bookingsKeys.detail(bookingId), data.booking);
      qc.invalidateQueries({ queryKey: bookingsKeys.mine() });
      qc.invalidateQueries({ queryKey: ["bookings", "hotel"] });
    },
  });
}
