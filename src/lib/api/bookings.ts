import { apiFetch } from "./apiFetch";
import type {
  Booking,
  BookingMutationResponse,
  BookingStatus,
  PaginatedBookings,
} from "@/types/api";

export interface CreateBookingPayload {
  hotelId: string;
  roomId: string;
  checkInDate: string; // ISO 8601
  checkOutDate: string; // ISO 8601
  numberOfGuests: number;
  specialRequests?: string;
}

export interface CreateBookingOnBehalfPayload {
  customerId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface UpdateBookingDetailsPayload {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export const bookingsApi = {
  // --- customer ---
  create: (payload: CreateBookingPayload) =>
    apiFetch<BookingMutationResponse>("/api/booking", {
      method: "POST",
      body: payload,
    }),

  // --- staff/admin: on behalf of a customer ---
  createOnBehalf: (payload: CreateBookingOnBehalfPayload) =>
    apiFetch<BookingMutationResponse>("/api/booking/hotel", {
      method: "POST",
      body: payload,
    }),

  // --- shared reads ---
  listMine: (params: ListBookingsParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch<PaginatedBookings>(`/api/booking/my${qs ? `?${qs}` : ""}`);
  },
  listForHotel: (hotelId: string, params: ListBookingsParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch<PaginatedBookings>(
      `/api/booking/hotel/${hotelId}${qs ? `?${qs}` : ""}`
    );
  },
  get: (bookingId: string) => apiFetch<Booking>(`/api/booking/${bookingId}`),

  // --- staff/admin mutations ---
  updateDetails: (bookingId: string, payload: UpdateBookingDetailsPayload) =>
    apiFetch<BookingMutationResponse>(`/api/booking/${bookingId}`, {
      method: "PATCH",
      body: payload,
    }),
  updateStatus: (bookingId: string, status: BookingStatus) =>
    apiFetch<BookingMutationResponse>(
      `/api/booking/${bookingId}/status`,
      { method: "PATCH", body: { status } }
    ),
  cancel: (bookingId: string) =>
    apiFetch<BookingMutationResponse>(`/api/booking/${bookingId}/cancel`, {
      method: "PATCH",
    }),
};
