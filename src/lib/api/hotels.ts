import { apiFetch } from "./apiFetch";
import type { Hotel, HotelAddress, PaginatedHotels } from "@/types/api";

export interface CreateHotelPayload {
  name: string;
  address: HotelAddress;
  phoneNumber?: string[];
  email?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  mapsUrl?: { googleMaps?: string; appleMaps?: string };
}

export type UpdateHotelPayload = Partial<CreateHotelPayload>;

export interface ListHotelsParams {
  page?: number;
  limit?: number;
  city?: string;
  country?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const hotelsApi = {
  // --- hotelAdmin: own hotel ---
  createHotel: (payload: CreateHotelPayload) =>
    apiFetch<Hotel>("/api/hotels", { method: "POST", body: payload }),
  getMyHotel: () => apiFetch<Hotel>("/api/hotels/my-hotel"),
  updateMyHotel: (payload: UpdateHotelPayload) =>
    apiFetch<Hotel>("/api/hotels/my-hotel", { method: "PATCH", body: payload }),
  deactivateMyHotel: () =>
    apiFetch<{ message: string }>("/api/hotels/my-hotel", { method: "DELETE" }),

  // --- public (no auth required — landing page, browse) ---
  listHotels: (params: ListHotelsParams = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.city) q.set("city", params.city);
    if (params.country) q.set("country", params.country);
    if (params.isActive !== undefined) q.set("isActive", String(params.isActive));
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const qs = q.toString();
    return apiFetch<PaginatedHotels>(`/api/hotels${qs ? `?${qs}` : ""}`, {
      _skipAuthRedirect: true,
    });
  },
  getHotel: (hotelId: string) =>
    apiFetch<Hotel>(`/api/hotels/${hotelId}`, { _skipAuthRedirect: true }),
};
